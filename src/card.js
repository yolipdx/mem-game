import React from 'react';
import './card.css';

function Card({r, g, b, x, y, w, h, value, click, revealed}) {
	const style = {
		top: `${y}`,
		left: `${x}`,
		width: `${w}`,
		height: `${h}`,
		lineHeight:	`${h}`
	}
	style.backgroundColor = !revealed ? `rgb(51, 133, 255)` : `rgb(${r}, ${g}, ${b})`;

	const content = !revealed ? "" : value;

	return (
		<div className='card' onClick={click} style={style}>
			{content}
		</div>
	);
}

export default Card;