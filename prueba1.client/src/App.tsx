import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

interface MainMenuProps {
    onStartGame: () => void;
}

interface GameSceneProps {
    onSelection: (selection: string) => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStartGame }) => {
    return (
        <div className="main-menu-container">
            <div className="main-menu">
                <h1>Piedra, Papel o Tijera</h1>
                <button onClick={onStartGame}>Jugar</button>
            </div>
        </div>
    );
};

const GameScene: React.FC<GameSceneProps> = ({ onSelection }) => {
    const [jugadas, setJugadas] = useState<string[]>([]);
    const [selections, setSelections] = useState<{ player1: string, player2: string }>({ player1: '', player2: '' });
    const [waitingMessage, setWaitingMessage] = useState<string>('Esperando al Jugador 1');
    const [gameInProgress, setGameInProgress] = useState<boolean>(true);
    const [score, setScore] = useState<{ player1: number, player2: number }>({ player1: 0, player2: 0 });
    const [roundWinner, setRoundWinner] = useState<string>('');

    useEffect(() => {
        jugadasData();
    }, []);

    async function jugadasData() {
        const response = await fetch('juego');
        const data = await response.json();
        setJugadas(data);
    }

    const handleKeyPress = useCallback((event: KeyboardEvent) => {
        if (!gameInProgress) return;
        switch (event.key) {
            case 'a':
                setSelections(prevState => ({ ...prevState, player1: jugadas[0] }));
                break;
            case 's':
                setSelections(prevState => ({ ...prevState, player1: jugadas[1] }));
                break;
            case 'd':
                setSelections(prevState => ({ ...prevState, player1: jugadas[2] }));
                break;
            case 'ArrowLeft':
                setSelections(prevState => ({ ...prevState, player2: jugadas[0] }));
                break;
            case 'ArrowDown':
                setSelections(prevState => ({ ...prevState, player2: jugadas[1] }));
                break;
            case 'ArrowRight':
                setSelections(prevState => ({ ...prevState, player2: jugadas[2] }));
                break;
            default:
                break;
        }
    }, [jugadas, gameInProgress]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [handleKeyPress]);

    useEffect(() => {
        const determineWinner = () => {
            const { player1, player2 } = selections;
            if (player1 && player2) {
                const winningConditions: Record<string, string> = {
                    [jugadas[0]]: jugadas[2],
                    [jugadas[1]]: jugadas[0],
                    [jugadas[2]]: jugadas[1],
                };
                if (player1 === player2) {
                    setRoundWinner('Empate');
                } else if (winningConditions[player1] === player2) {
                    setRoundWinner('Jugador 1');
                    setScore(prevState => ({ ...prevState, player1: prevState.player1 + 1 }));
                } else {
                    setRoundWinner('Jugador 2');
                    setScore(prevState => ({ ...prevState, player2: prevState.player2 + 1 }));
                } 
                setGameInProgress(false);
                setTimeout(() => {
                    resetRound();                                     
                }, 2000);              
            }
        };
        determineWinner();
    }, [selections, jugadas]);

    const resetRound = () => {
        setSelections({ player1: '', player2: '' });
        if (score.player1 === 3 || score.player2 === 3) {
            setGameInProgress(false);
        } else if (score.player1 < 3 || score.player2 < 3) {
            setGameInProgress(true);
        }
        if (score.player1 === 3) {
            setWaitingMessage('Jugador 1 ha ganado la partida');
        } else if (score.player2 === 3) {
            setWaitingMessage('Jugador 2 ha ganado la partida');
        } 
        setRoundWinner('');
    };

    useEffect(() => {
        if (selections.player1 && !selections.player2) {
            setWaitingMessage('Esperando al Jugador 2...');
        } else if (!selections.player1 && selections.player2) {
            setWaitingMessage('Esperando al Jugador 1...');
        } else {
            setWaitingMessage('');
        }
    }, [selections]);

    const handleRestart = () => {
        setScore({ player1: 0, player2: 0 });
        resetRound();
        setGameInProgress(true);

    };

    return (
        <div className="game-scene-container">
            <div className="game-scene">
                <div className="player">
                    <h2>Jugador 1</h2>
                    <p>Victorias: {score.player1}</p>
                    <div className="options">
                        {jugadas.map((jugada, index) => (
                            <button key={index} onClick={() => onSelection(jugada)} disabled={!gameInProgress}>
                                {jugada} <br />
                                <span>({index === 0 ? 'A' : index === 1 ? 'S' : 'D'})</span>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="player">
                    <h2>Jugador 2</h2>
                    <p>Victorias: {score.player2}</p>
                    <div className="options">
                        {jugadas.map((jugada, index) => (
                            <button key={index} onClick={() => onSelection(jugada)} disabled={!gameInProgress}>
                                {jugada} <br />
                                <span>({index === 0 ? '←' : index === 1 ? '↓' : '→'})</span>
                            </button>
                        ))}
                    </div>
                </div>
                {(roundWinner === 'Empate' || roundWinner === 'Jugador 1' || roundWinner === 'Jugador 2') && <p className="round-winner">{roundWinner === 'Empate' ? 'Empate' : `${roundWinner} ha ganado la ronda`}</p>}
                {waitingMessage && <div className="waiting-message">{waitingMessage}</div>}
                {(score.player1 >= 3 || score.player2 >= 3) && (
                    <div className="result">
                        <h2>{score.player1 === 3 ? 'Jugador 1' : 'Jugador 2'} ha ganado la partida</h2>
                        <button onClick={handleRestart}>Volver a jugar</button>
                    </div>
                )}
            </div>
        </div>
    );
};

const App: React.FC = () => {
    const [gameStarted, setGameStarted] = useState(false);

    const handleStartGame = () => {
        setGameStarted(true);
    };

    return (
        <div className="app">
            {!gameStarted && <MainMenu onStartGame={handleStartGame} />}
            {gameStarted && <GameScene onSelection={() => { }} />}
        </div>
    );
};

export default App;