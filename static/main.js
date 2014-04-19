var game, board;
var players = {};
var fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"

var byteArrayToString = function(byteArray) {
  var fen = ""
  for(var i=0; i<byteArray.length; i++) {
      fen += String.fromCharCode(byteArray[i]);
  }
  return fen;
}

var stringToByteArray = function() {
  return fen.split("").map(function(c) { return c.charCodeAt(0); });
}

var onDragStart = function(source, piece, position, orientation) {
    var pieceColor = (piece.search(/^b/) !== -1) ? "b" : "w";
    var isHuman = (players[pieceColor] == "human")
    var isTurn = (pieceColor == game.turn());
    var gameOver = (game.in_checkmate() === true || game.in_draw() === true);
    return !gameOver && isTurn && isHuman;
};

$("#options .start button").on('click', function() {
    $("#options").hide();
    players["b"] = $("#options .black").val();
    players["w"] = $("#options .white").val();
    board.position(fen);
    game = new Chess(fen);
    nextMove();
 });

$("#gameover button").on('click', function() {
    $("#options").show();
    $("#gameover").hide();
});

var makeRandomMove = function() {
    var possibleMoves = game.moves();
    var randomIndex = Math.floor(Math.random() * possibleMoves.length);
    game.move(possibleMoves[randomIndex]);
    board.position(game.fen());
    nextMove();
};

var nextMove = function() {
    var gameOver = (game.in_checkmate() === true || game.in_draw() === true);
    if (gameOver) {
        $("#gameover").show();

        var result = "Game over";
        if (game.in_draw()) {
            result = "Stalemate"
        }
        if (game.in_checkmate()) {
            if (game.turn() == "w") {
                result = "Checkmate. Black wins.";
            } else {
                result = "Checkmate. White wins.";
            }
        }
        $("#gameover h3").html(result);
        return;
    }
    var player = players[game.turn()];
    if (player == "computer") {
        var fen = game.fen()
        fen.byteLength = fen.length;
        var data = fen.split("").map(function(c) { return c.charCodeAt(0); });
        worker.postMessage({"funcName": "make_move", "data": data });
    }
    if (player == "random") {
        setTimeout(makeRandomMove, 250);
    }
}

var onDrop = function(source, target) {
    var move = game.move({
            from: source,
            to: target,
            promotion: 'q'});

    // illegal move
    if (move === null) return 'snapback';

    nextMove();
};

var onSnapEnd = function() {
    board.position(game.fen());
};

var handle_message = function(event) {
    var fen = byteArrayToString(event.data.data);
    // fixes a bug where the move number is not incremented correctly.
    fen = fen.split(" ").slice(0, -1).join(" ") + " 1";
    game.load(fen);
    board.position(game.fen());
    nextMove();
};

var cfg = {
  draggable: true,
  pieceTheme: '/static/chessboardjs/img/chesspieces/wikipedia/{piece}.png',
  position: fen,
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd
};

board = new ChessBoard('board', cfg);
var worker = new Worker('bin/chess-at-nite.js');
worker.onmessage = handle_message;
