import random

questions = [
    ("avoir", "have"),
    ("rêver", "dream"),
    ("lire", "read"),
    ("aller", "go"),
    ("manger", "eat"),
    ("perdre", "lose"),
    ("casser", "break"),
    ("nager", "swim"),
    ("voir", "see"),
    ("être", "be"),
    ("tomber", "fall"),
    ("faire", "do"),
    ("gagner", "win"),
    ("couper", "cut"),
    ("boire", "drink"),
    ("acheter", "buy"),
]

translations = {verb: english for verb, english in questions}
verbs = [verb for verb, _ in questions]

print("=== Questionnaire sur les verbes irréguliers ===")
print("Réponds en anglais aux verbes français proposés.")
print("Tape ton answer puis appuie sur Entrée."")
print("Tu peux quitter à tout moment avec Ctrl+C.")
print()

random.shuffle(questions)
score = 0

for index, (verb, correct_answer) in enumerate(questions, start=1):
    wrong_answers = [answer for v, answer in questions if answer != correct_answer]
    options = random.sample(wrong_answers, 3) + [correct_answer]
    random.shuffle(options)

    print(f"Question {index}/{len(questions)} : quel est le sens anglais de '{verb}' ?")
    for i, option in enumerate(options, start=1):
        print(f"  {i}. {option}")

    while True:
        answer = input("Ta réponse (1-4) : ").strip()
        if answer in {"1", "2", "3", "4"}:
            selected = options[int(answer) - 1]
            break
        print("Entrée invalide. Choisis 1, 2, 3 ou 4.")

    if selected.lower() == correct_answer.lower():
        print("✅ Bonne réponse !\n")
        score += 1
    else:
        print(f"❌ Mauvaise réponse. La bonne réponse était : {correct_answer}.\n")

print("=== Résultat ===")
print(f"Score final : {score} / {len(questions)}")
if score == len(questions):
    print("Bravo ! Tu connais bien la liste de verbes.")
elif score >= len(questions) * 0.75:
    print("Très bien, continue comme ça !")
else:
    print("Ce n'est que le début, rejoue pour t'améliorer.")
