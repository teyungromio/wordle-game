import { useCallback, useEffect, useState } from "react";
import "./App.css";

const WORDS = [
  "APPLE", "BRAVE", "CHAIR", "DREAM", "EARTH", "FLAME", "GRAPE",
  "HOUSE", "JUICE", "KNIFE", "LIGHT", "MONEY", "NIGHT", "OCEAN",
  "PLANT", "QUEEN", "ROBOT", "SMILE", "TIGER", "WATER", "BRAIN",
  "CLOUD", "DANCE", "ENJOY", "FRUIT", "GHOST", "HEART", "MAGIC",
  "MUSIC", "PEACE", "SHINE", "STONE", "TRAIN", "WORLD", "YOUTH",
  "ALARM", "BEACH", "CANDY", "FRESH", "SWEET", "GREEN", "BLACK",
  "WHITE", "BREAD", "CRANE", "SHEEP", "SPOON", "TRUCK", "PLANE"
];

const KEYBOARD = [
  "QWERTYUIOP".split(""),
  "ASDFGHJKL".split(""),
  ["ENTER", ..."ZXCVBNM", "⌫"]
];

const MAX_ATTEMPTS = 6;

function chooseWord(previousWord) {
  let nextWord = previousWord;
  while (nextWord === previousWord) {
    nextWord = WORDS[Math.floor(Math.random() * WORDS.length)];
  }
  return nextWord;
}

function getLetterStatuses(guess, answer) {
  const statuses = Array(5).fill("absent");
  const remaining = answer.split("");

  // Mark letters that are correct and in the correct position first.
  for (let i = 0; i < 5; i += 1) {
    if (guess[i] === answer[i]) {
      statuses[i] = "correct";
      remaining[i] = null;
    }
  }

  // Then mark letters that are in the word but in another position.
  for (let i = 0; i < 5; i += 1) {
    if (statuses[i] === "correct") continue;

    const matchingIndex = remaining.indexOf(guess[i]);
    if (matchingIndex !== -1) {
      statuses[i] = "present";
      remaining[matchingIndex] = null;
    }
  }

  return statuses;
}

function App() {
  const [answer, setAnswer] = useState(() => chooseWord(""));
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [keyboardStatus, setKeyboardStatus] = useState({});
  const [gameStatus, setGameStatus] = useState("playing");
  const [message, setMessage] = useState("");
  const [shake, setShake] = useState(false);

  const showTemporaryMessage = (text) => {
    setMessage(text);
    setShake(true);
    window.setTimeout(() => setShake(false), 450);
  };

  const submitGuess = useCallback(() => {
    if (gameStatus !== "playing") return;

    if (currentGuess.length !== 5) {
      showTemporaryMessage("Not enough letters");
      return;
    }

    if (!WORDS.includes(currentGuess)) {
      showTemporaryMessage("Word not in this game's word list");
      return;
    }

    const newGuesses = [...guesses, currentGuess];
    const statuses = getLetterStatuses(currentGuess, answer);

    setGuesses(newGuesses);
    setCurrentGuess("");
    setMessage("");

    setKeyboardStatus((previous) => {
      const updated = { ...previous };
      const priority = { absent: 1, present: 2, correct: 3 };

      currentGuess.split("").forEach((letter, index) => {
        const nextStatus = statuses[index];
        if (!updated[letter] || priority[nextStatus] > priority[updated[letter]]) {
          updated[letter] = nextStatus;
        }
      });

      return updated;
    });

    if (currentGuess === answer) {
      setGameStatus("won");
      setMessage("Excellent! You got it!");
    } else if (newGuesses.length === MAX_ATTEMPTS) {
      setGameStatus("lost");
      setMessage(`The word was ${answer}`);
    }
  }, [answer, currentGuess, gameStatus, guesses]);

  const handleKeyPress = useCallback((key) => {
    if (gameStatus !== "playing") return;

    if (key === "ENTER") {
      submitGuess();
    } else if (key === "⌫" || key === "BACKSPACE") {
      setCurrentGuess((previous) => previous.slice(0, -1));
      setMessage("");
    } else if (/^[A-Z]$/.test(key)) {
      setCurrentGuess((previous) =>
        previous.length < 5 ? previous + key : previous
      );
      setMessage("");
    }
  }, [gameStatus, submitGuess]);

  useEffect(() => {
    const handlePhysicalKey = (event) => {
      if (event.key === "Enter") {
        handleKeyPress("ENTER");
      } else if (event.key === "Backspace") {
        handleKeyPress("BACKSPACE");
      } else if (/^[a-zA-Z]$/.test(event.key)) {
        handleKeyPress(event.key.toUpperCase());
      }
    };

    window.addEventListener("keydown", handlePhysicalKey);
    return () => window.removeEventListener("keydown", handlePhysicalKey);
  }, [handleKeyPress]);

  const restartGame = () => {
    setAnswer((previous) => chooseWord(previous));
    setGuesses([]);
    setCurrentGuess("");
    setKeyboardStatus({});
    setGameStatus("playing");
    setMessage("");
    setShake(false);
  };

  const getTile = (rowIndex, colIndex) => {
    if (rowIndex < guesses.length) {
      const guess = guesses[rowIndex];
      return {
        letter: guess[colIndex],
        status: getLetterStatuses(guess, answer)[colIndex]
      };
    }

    if (rowIndex === guesses.length) {
      return {
        letter: currentGuess[colIndex] || "",
        status: ""
      };
    }

    return { letter: "", status: "" };
  };

  return (
    <div className="app">
      <header className="header">
        <button
          className="icon-button"
          aria-label="How to play"
          onClick={() => setMessage("Guess the five-letter word in six tries. Green is the right letter in the right place. Yellow is in the word but in the wrong place.")}
        >
          ?
        </button>
        <h1>WORDLE</h1>
        <button className="icon-button" aria-label="New game" onClick={restartGame}>
          ↻
        </button>
      </header>

      <main className="game-container">
        <div className="game-info">
          <span>GUESS THE WORD</span>
          <span>{guesses.length}/{MAX_ATTEMPTS} ATTEMPTS</span>
        </div>

        <section className={`board ${shake ? "shake" : ""}`} aria-label="Word grid">
          {Array.from({ length: MAX_ATTEMPTS }).map((_, rowIndex) => (
            <div className="board-row" key={rowIndex}>
              {Array.from({ length: 5 }).map((_, colIndex) => {
                const tile = getTile(rowIndex, colIndex);
                return (
                  <div
                    key={colIndex}
                    className={`tile ${tile.status} ${tile.letter && !tile.status ? "filled" : ""} ${rowIndex < guesses.length ? "reveal" : ""}`}
                    style={{ animationDelay: `${colIndex * 90}ms` }}
                  >
                    {tile.letter}
                  </div>
                );
              })}
            </div>
          ))}
        </section>

        <div className="message-area" aria-live="polite">
          {message && <div className="message">{message}</div>}
        </div>

        {gameStatus !== "playing" && (
          <section className="game-result">
            <h2>{gameStatus === "won" ? "YOU WON!" : "GAME OVER"}</h2>
            <p>
              {gameStatus === "won"
                ? `You guessed ${answer} correctly.`
                : `The correct word was ${answer}.`}
            </p>
            <button className="new-game-button" onClick={restartGame}>
              PLAY AGAIN
            </button>
          </section>
        )}

        <section className="keyboard" aria-label="On-screen keyboard">
          {KEYBOARD.map((row, rowIndex) => (
            <div className="keyboard-row" key={rowIndex}>
              {row.map((key) => {
                const special = key === "ENTER" || key === "⌫";
                return (
                  <button
                    key={key}
                    className={`key ${special ? "special-key" : ""} ${keyboardStatus[key] || ""}`}
                    onClick={() => handleKeyPress(key)}
                    disabled={gameStatus !== "playing"}
                    aria-label={key === "⌫" ? "Backspace" : key}
                  >
                    {key}
                  </button>
                );
              })}
            </div>
          ))}
        </section>

        <footer className="footer">
          <p>WORDLE · A FIVE-LETTER WORD GAME</p>
          <p>Made with React</p>
        </footer>
      </main>
    </div>
  );
}

export default App;