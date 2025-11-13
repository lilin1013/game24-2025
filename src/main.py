import sys
from game24 import Game24

def main():
    game = Game24()
    print("Welcome to Math Game 24!")
    while not game.is_game_over():
        print(f"\nRound {game.current_round}")
        cards = game.generate_cards()
        print(f"Cards: {cards}")
        winner = None
        while not winner:
            for player in ["Player 1", "Player 2"]:
                expr = input(f"{player}, enter your calculation to make 24: ")
                if game.check_solution(expr):
                    print(f"Correct! {player} wins this round.")
                    game.add_score(player)
                    winner = player
                    break
                else:
                    print("Incorrect. Try again.")
        game.next_round()
    print("\nGame Over!")
    print(f"Scores: {game.scores}")
    print(f"Winner: {game.get_winner()}")

if __name__ == "__main__":
    main()
