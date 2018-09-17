import React from 'react';
import './player.css';


function convertToHHMMSS (sec_num) {
	    let hours   = Math.floor(sec_num / 3600);
	    let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
	    let seconds = sec_num - (hours * 3600) - (minutes * 60);

	    if (hours   < 10) {
	    	hours = "0"+hours;
	    }
	    
	    if (minutes < 10) {
	    	minutes = "0"+minutes;
	    }

	    if (seconds < 10) {
	    	seconds = "0"+seconds;
	    }

	    return hours+':'+minutes+':'+seconds;
}

function Player({name, score, win, timeUsed, active, w, h}) {
	const style = {};
	if (active) {
		style.border = `1px solid #ffbf80`;
		style.backgroundColor = 'rgb(204, 224, 255)';
	}

	let resultClass;
	if (win === 'win' || win === 'even') {
		resultClass = `result-win`;
	} else {
		resultClass = `result-lose`;
	}

	return (
		<div className='player' style={style}>
			<i>name:</i><span className='name'> {name}</span> <i>score:</i> <span className='score'>{score}</span>  <i>time:</i> <span className='time'>{convertToHHMMSS(timeUsed)}</span>
			{win && <p className={`${resultClass}`}>{win}</p>}
		</div>
	);
}

export default Player;