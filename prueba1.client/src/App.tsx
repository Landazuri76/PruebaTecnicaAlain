import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

interface MainMenuProps {
    onStartGame: () => void;
}

interface GameSceneProps {
    onSelection: (selection: string) => void;
}
//Menu principal con botón que activa la función onStartGame y da paso al juego.
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
//
const GameScene: React.FC<GameSceneProps> = ({ onSelection }) => {
    const [jugadas, setJugadas] = useState<string[]>([]);//Almacena las opciones del juego(piedra,papel y tijera).
    const [selections, setSelections] = useState<{ player1: string, player2: string }>({ player1: '', player2: '' });//Almacena las selecciones que realice el usuario.
    const [waitingMessage, setWaitingMessage] = useState<string>('Esperando al Jugador 1');//Mensaje que se muestra cuando un jugador ha hecho su seleccion.
    const [gameInProgress, setGameInProgress] = useState<boolean>(true);//Indica si el juego esta en curso.
    const [score, setScore] = useState<{ player1: number, player2: number }>({ player1: 0, player2: 0 });//Almacena la puntuación de cada jugador.
    const [roundWinner, setRoundWinner] = useState<string>('');//Indica el jugador ganador.

    //Inicializa las jugadas.
    useEffect(() => {
        jugadasData();
    }, []);

    //Función que toma los datos enviados por el backend y los almacena.
    async function jugadasData() {
        const response = await fetch('juego');
        const data = await response.json();
        setJugadas(data);
    }
    //Controla los eventos del teclado para que los jugadores puedan hacer su selección mediante las teclas asignadas a cada botón.
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

    //Para manejar el evento del teclado.
    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [handleKeyPress]);

    //Determina el ganador de cada ronda y suma 1 al contador de victorias.
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
                //Al hacer la jugada el juego se detiene para que no se puedan realizar acciones mientras se muestra el resultado de la ronda.
                setGameInProgress(false);
                //Se establece un pequeño tiempo para que el usuario vea el resultado antes de volver a tener el conrtol.
                setTimeout(() => {
                    resetRound();                                     
                }, 2000);              
            }
        };
        determineWinner();
    }, [selections, jugadas]);

    //Se usa para detectar si alguno de los jugadores ha alcanzado las 3 victorias.
    //Se establece un valor a gameInProgress dependiendo de si el juego continua o se ha terminado.
    const resetRound = () => {
        setSelections({ player1: '', player2: '' });
        if (score.player1 === 3 || score.player2 === 3) {
            setGameInProgress(false);
        } else if (score.player1 < 3 || score.player2 < 3) {
            setGameInProgress(true);
        }
        if (score.player1 === 3) {
            setWaitingMessage('Jugador 1 ha ganado la partida');
        } if (score.player2 === 3) {
            setWaitingMessage('Jugador 2 ha ganado la partida');
        } 
        setRoundWinner('');
    };

    //Mensaje que se muestra cuando uno de los jugadores ha hecho su selección y se espera respuesta del otro.
    useEffect(() => {
        if (selections.player1 && !selections.player2) {
            setWaitingMessage('Esperando al Jugador 2...');
        } else if (!selections.player1 && selections.player2) {
            setWaitingMessage('Esperando al Jugador 1...');
        } else {
            setWaitingMessage('');
        }
    }, [selections]);

    //Se usa cuando uno de los jugadores ha alcanzado las 3 victorias
    // para reiniciar los marcadores de ambos jugadores y dar paso a una nueva partida.
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