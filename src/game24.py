import random

class Game24:
    def __init__(self, rounds=10):
        self.rounds = rounds
        self.current_round = 1
        self.scores = {"Player 1": 0, "Player 2": 0}
        self.cards = []

    def generate_cards(self):
        self.cards = [random.randint(1, 10) for _ in range(4)]
        return self.cards

    def check_solution(self, expression):
        try:
            # Only allow numbers from self.cards
            nums = [str(n) for n in self.cards]
            for n in nums:
                if expression.count(n) != nums.count(n):
                    return False
            return eval(expression) == 24
        except Exception:
            return False

    def add_score(self, player):
        self.scores[player] += 5

    def next_round(self):
        self.current_round += 1
        self.generate_cards()

    def is_game_over(self):
        return self.current_round > self.rounds

    def get_winner(self):
        if self.scores["Player 1"] > self.scores["Player 2"]:
            return "Player 1"
        elif self.scores["Player 2"] > self.scores["Player 1"]:
            return "Player 2"
        else:
            return "Draw"
