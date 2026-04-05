# Branie API

Branie er hub'en. Andre apps (opgaver, noter, kalender) kan koble op og udveksle data.

---

## 1. LocalStorage (samme origin, nemmest)

Branie gemmer al data under disse nøgler:

```js
const projects = JSON.parse(localStorage.getItem('branie2_projects') || '[]');
const ideas    = JSON.parse(localStorage.getItem('branie2_ideas')    || '[]');
```

Din app kan læse og skrive direkte, hvis den kører på samme domæne.

---

## 2. postMessage API (cross-origin)

### Push data til Branie
```js
const branie = window.open('https://branie.app/', 'branie');

branie.postMessage({
  type: 'branie:push',
  app: 'Opgave App',
  tasks_open: 7,
  notes_count: 3
}, 'https://branie.app');
```

### Hent projekter fra Branie
```js
branie.postMessage({ type: 'branie:getProjects' }, '*');

window.addEventListener('message', e => {
  if (e.data?.type === 'branie:projects') {
    console.log(e.data.projects); // array af projekter
  }
});
```

### Tilføj en idé direkte
```js
// Kald Branie's globale API (samme origin)
window.BRANIE.addIdea('Min idé fra opgave-appen', 'idé', 'Projektnavnet');
```

---

## 3. URL-protokol

```
branie://connect?app=MinApp
branie://idea/new?text=Min+idé&project=Projektnavn
branie://project/new?name=Nyt+projekt
```

---

## 4. Service Worker relay (PWA til PWA)

```js
navigator.serviceWorker.controller?.postMessage({
  type: 'branie:register',
  app: 'Min App'
});

navigator.serviceWorker.addEventListener('message', e => {
  if (e.data?.type === 'branie:app-registered') {
    console.log('Tilsluttet Branie!');
  }
});
```

---

## Data-formater

### Projekt
```ts
{
  id:     number;
  name:   string;
  desc:   string;
  emoji:  string;
  color:  'terra' | 'sage' | 'sky' | 'gold' | 'rose';
  status: 'active' | 'idea' | 'pause';
  prog:   number;   // 0–100
  tasks:  number;
  ideas:  number;
}
```

### Idé
```ts
{
  id:    number;
  text:  string;
  type:  'idé' | 'note' | 'link' | 'projekt';
  proj:  string | null;   // projektnavnet
  color: 'terra' | 'sage' | 'sky' | 'gold' | 'rose';
  when:  string;          // 'Nu', 'I dag', 'I går', etc.
}
```
