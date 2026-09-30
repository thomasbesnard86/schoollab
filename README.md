# Schoollab

Schoollab rassemble des mini-applications web pour réviser différentes matières du collège. La page d'accueil (`index.html`) permet d'ouvrir les applications disponibles.

## Applications

- **Verbes irréguliers** (`irregularverbs/`) : quiz d'anglais sur l'infinitif, le simple past et le past participle, avec reprise des erreurs, historique des scores et tableau des verbes imprimable. `main.py` est un ancien prototype en console, distinct de l'application web.
- **ToolsKey** (`toolsKey/`) : révision de vocabulaire anglais-français pour accompagner la préparation de l'A2 Key de Cambridge. Les 98 entrées disponibles peuvent être étudiées dans les deux sens, à l'oral ou à l'écrit, avec historique et reprise des mots à revoir. Ce n'est pas un examen blanc.

## Organisation

- `index.html` : catalogue des applications.
- `src/` : feuille de style partagée par le catalogue et les applications.
- `irregularverbs/` : pages, scripts et styles du quiz de verbes irréguliers.
- `toolsKey/` : application de vocabulaire; `resources/` contient le manifeste et les listes de mots chargées par l'application.
- `toolsKey/pythonscript/` : scripts et fichiers de préparation conservés localement; ce dossier est exclu des commits par `.gitignore` et n'est pas publié sur GitHub.

## Lancer le site

Depuis la racine du projet, démarre un serveur web local :

```powershell
py -m http.server 8000
```

Ouvre ensuite [http://localhost:8000](http://localhost:8000). Le serveur est nécessaire pour que ToolsKey puisse charger ses fichiers JSON. Pour arrêter le serveur, utilise `Ctrl+C` dans le terminal.