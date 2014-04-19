#include "common/globals.h"
#include <iostream>
#include <string>
#include <vector>
#include <stdlib.h>

#include "common/define.h"
#include "model/MoveGenerator.h"
#include "model/Game.h"
#include "player/Player.h"
#include "player/HumanPlayer.h"
#include "player/ComputerPlayer.h"
#include "control/CLI.h"
#include "common/extra_utils.h"
#include "control/PGN.h"
#include "control/XBoard.h"
#include <emscripten.h>

extern "C" {

    char* copy_string(string s) {
        char *cstr = new char[s.length() + 1];
        strcpy(cstr, s.c_str());
        cstr[s.length()] = '\0';
        return cstr;
    }

    void make_move(char *fen, int size) {
        srand(time(NULL));
        init_globals();
        string s = string(fen);
        Board board = Board(s);
        Player* player = new ComputerPlayer();
        player->set_board(&board);
        move next_move = player->get_move();
        board.play_move(next_move);
        string ret_fen = board.get_fen();
        char* cstr = copy_string(ret_fen);
        emscripten_worker_respond(cstr, ret_fen.length() + 1);
    }
}
