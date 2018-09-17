import React from 'react';
import Card from './card';
import Player from './player';

import './board.css';

class Board extends React.Component {
	constructor(props) {
		super(props);

		let cellHeight = 80;
		let cellWidth = 60;
		let cellMargin = 5;

		let cellCount = props.cellCount || 6;
		this.state = {};
		this.initState({
			cellWidth: cellWidth,
			cellHeight: cellHeight,
			cellMargin: cellMargin,
			cellCount: cellCount
		}, true);
	}	


	initState({cellWidth, cellHeight, cellMargin, cellCount}, inited) {
		let cardsCount = 2 * cellCount;

		// console.log(cellWidth, cellHeight, cellMargin);
		// console.log(cellCount, inited);

		this.silence = false;
		this.clickedCards = [];
		this.currentPlayer = 0;
		this.timers = [];

		let cards = this.buildCards(cellCount, cardsCount, cellWidth, cellHeight, cellMargin);
		let state = {
			cellHeight: cellHeight,
			cellWidth: cellWidth,
			cellMargin: cellMargin,

			cellCount: cellCount,
			cardsCount: cardsCount,
			w: cellCount * cellWidth + cellMargin * (cellCount + 1),
			h: cellCount * cellHeight + cellMargin * (cellCount + 1),
			cards: cards,
			restCards: 2 * cardsCount,

			// game mode
			twoPlayersMode: true,
			players: [{
				score: 0,
				timeUsed: 0,
				active: 'active',
				win: ''
			},{
				score: 0,
				timeUsed: 0,
				active: '',
				win: ''
			}]
		};

		if (inited) {
			this.state = state;
		} else {
			this.setState(state);
		}
	}

	generateCoordinates(cellCount) {
		// let w = this.state.width;
		let coord = [];
		for (let row = 0; row < cellCount; ++row) {
			for (let col = 0; col < cellCount; ++col) {
				coord.push({x: col, y: row});
			}
		}
		// shuffle the coordinates
		return shuffle(coord);

		function shuffle(arr) {
			for (let i = arr.length - 1; i >= 0; --i) {
				let idx = Math.floor(Math.random() * (i + 1));
				[arr[i], arr[idx]] = [arr[idx], arr[i]];
			}
			return arr;
		}
	}

	tint(cards) {
		const tintFactor = 0.3;
		for (let c of cards) {
			c.r = c.r + (255 - c.r) * tintFactor;
			c.g = c.g + (255 - c.g) * tintFactor;
			c.b = c.b + (255 - c.b) * tintFactor;
		}	
	}

	buildCards(cellCount, cardsCount, cellWidth, cellHeight, cellMargin) {
		// generate card pair group: number and color
		let cards = [];
		let coord = this.generateCoordinates(cellCount);

		for (let i = 0; i < cardsCount; ++i) {
			cards.push({
				value: i,
				r: Math.floor(256 * Math.random()),
				g: Math.floor(256 * Math.random()),
				b: Math.floor(256 * Math.random()),
				w: cellWidth + 'px',
				h: cellHeight + 'px',
				revealed: false
			});
		}

		this.tint(cards);

		let allCards = [...cards];
		for (let c of cards) {
			allCards.push({...c});
		}

		for (let i = 0; i < allCards.length; ++i) {
			let card = allCards[i];
			card.idx = i;
			card.x = coord[i].x * cellWidth + (coord[i].x + 1) * cellMargin + 'px';
			card.y = coord[i].y * cellHeight + (coord[i].y + 1) * cellMargin + 'px';
		}

		return allCards;
	}

	onCardClick = (e, index) => {
		// wait for the current session end
		if (this.silence) {
			return;
		}

		// invalid click
		if (this.state.cards[index].revealed) {
			return;
		}

		if (this.clickedCards.length < 2) {
			this.showCard(index);
			this.clickedCards.push(index);
		}

		if (this.clickedCards.length === 2) {
			this.silence = true;
			this.showResult(this.clickedCards[0], this.clickedCards[1]);	
		}
	}

	// componentDidUpdate(prevProps, prevState) {
		// console.log('componentDidUpdate ', this.state.restCards);	
	// }

	showResult(card1, card2) {
		// hide the two cards if they are different
		let isMatch = this.state.cards[card1].value === this.state.cards[card2].value;
		
		let resetCardCnt = this.state.restCards;
		if (isMatch) {
			resetCardCnt -= 2;

			this.setState({restCards: resetCardCnt});	
			this.updateScore();

		}

		// starts another player if any
		if (0 === resetCardCnt) {	// game ends
			this.gameEnd();
			return;
		} 

		let timerId = setTimeout(() => {
			if (!isMatch) {
				this.hideTwoCards(card1, card2);
			}
			
			// clear clicked cards for next round
			this.clickedCards = [];

			// switch to another player
			if (this.state.twoPlayersMode && ! isMatch) {
				this.switchPlayer();
			}
			clearTimeout(timerId);

			this.silence = false;
		}, 1000);
	}

	updateScore() {
		let players = this.state.players;
		let player = players[this.currentPlayer];
		player.score ++;
		this.setState({
			players: [...players]
		});	
	}

	switchPlayer() {
		// save the timer of current player
		this.clearClock(this.currentPlayer);
		if (this.state.twoPlayersMode) {
			this.currentPlayer = 1 - this.currentPlayer;
		}
		this.setClock(this.currentPlayer);
	}

	clearClock(playerIndex) {
		// console.log('clear ', playerIndex);
		let players = this.state.players;
		let player = players[playerIndex];
		player.active = '';
		this.setState({
			players: [...players]
		});
		this.timers[playerIndex] && clearInterval(this.timers[playerIndex]);
		this.timers[playerIndex] = null;
	}


	// timer clock
	setClock(playerIndex) {
		this.timers[playerIndex] = setInterval(() => {
			this.setState(prevState => {
				let players = prevState.players;
				let player = players[playerIndex];

				player.active = 'active';
				++player.timeUsed;

				return {
					players: [...players]
				};
			});


		}, 1000);
	}


	hideTwoCards(c1, c2) {
		let cards = this.state.cards;
		cards[c1].revealed = false;	
		cards[c2].revealed = false;

		this.setState({
			cards: [...cards]
		});
	}

	showCard(index) {
		let cards = this.state.cards;
		cards[index].revealed = true;

		this.setState({
			cards: [...cards]
		});
	}

	gameEnd() {
		this.clearClock(0);
		this.clearClock(1);

		let players = this.state.players;
		let p0 = players[0];
		let p1 = players[1];

		console.log('gameEnd');
		if (p0.score === p1.score) {
			p0.win = 'even';
			p1.win = 'even';
			this.setState({
				players: [...players]
			});
			return;
		}

		let isP0Win = p0.score > p1.score;
		p0.win = isP0Win ? 'win' : 'lose';
		p1.win = isP0Win ? 'lose' : 'win';
		this.setState({
			players: [...players]
		});
	}

	componentDidMount() {
		this.setClock(0);	
	}


	// game control
	reset() {
		this.clearClock(0);	
		this.clearClock(1);
		let restCards = 2 * this.cardsCount;
		let players = [{
				score: 0,
				timeUsed: 0,
				active: 'active',
				win: ''
			},{
				score: 0,
				timeUsed: 0,
				active: '',
				win: ''
		}];

		let cards = this.buildCards(this.state.cellCount, 
			this.state.cardsCount, 
			this.state.cellWidth, 
			this.state.cellHeight, 
			this.state.cellMargin);

		this.setState({
			cards: cards,
			players: players,
			restCards:restCards
		});

		// console.log('before clock', this.state.players);
		this.setClock(0);
	}

	incGameLevel() {
		this.adjustGameLevel(true);
	}

	decGameLevel() {
		this.adjustGameLevel(false);
	}

	adjustGameLevel(inc) {
		let cellCount = this.state.cellCount;
		if (inc) {
			++cellCount;
		} else {
			--cellCount;
		}

		if (cellCount >= 25) {
			cellCount = 25;
		}

		if (cellCount <= 4) {
			cellCount = 4;
		}

		this.clearClock(0);	
		this.clearClock(1);

		let {cellWidth, cellHeight, cellMargin} = this.state;
		this.initState({cellWidth, cellHeight, cellMargin, cellCount}, false);
		this.setClock(0);
	}

	render() {
		const style = {
			width: `${this.state.w}px`,
			height: `${this.state.h}px`
		};

		let cards = this.state.cards && this.state.cards.map((c, index) => 
			<Card key={index} value={c.value} r={c.r} g={c.g} b={c.b} x={c.x} y={c.y} w={c.w} h={c.h} revealed={c.revealed}
			click={(e) => this.onCardClick(e, index)} />);

		return (
			<div>
				<div className='board' style={style}>
			 		{cards}
			 	</div>
			 	<div className='status'>
				 	
			 		<Player name='p1' 
			 		        score={`${this.state.players[0].score}`} 
			 		        timeUsed={`${this.state.players[0].timeUsed}`} 
			 		        active={`${this.state.players[0].active}`}
			 		        win={`${this.state.players[0].win}`}
			 		        w='150' h={`${this.state.h}`} />

			 		{this.state.twoPlayersMode &&  
			 			<Player name='p2' 
			 		        score={`${this.state.players[1].score}`} 
			 		        timeUsed={`${this.state.players[1].timeUsed}`}
			 		        active={`${this.state.players[1].active}`}
			 		        win={`${this.state.players[1].win}`}
			 		        w='150' h={`${this.state.h}`} />	
			 		}
		 		</div>
		 		
		 		<button onClick={() => {this.reset()}}>Reset Game</button>
		 		<div>
		 		<p>Adjust Game Level</p>
		 			<button className='level-adjust' onClick={() => {this.incGameLevel()}}> + </button>
		 			<button className='level-adjust' onClick={() => {this.decGameLevel()}}> - </button>
		 		</div>

		 		
		 		

		 	</div>
		);
	}
}

export default Board;