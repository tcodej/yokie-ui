import { useState, useEffect } from 'react';

export default function SoundMenu() {
	const [isOpen, setIsOpen] = useState(false);

	const sounds = [
		{ name: 'applause', file: 'applause.mp3' },
		{ name: 'boo', file: 'boo.mp3' },
		{ name: 'boing', file: 'boing.mp3' },
		{ name: 'count off', file: 'count-off.mp3' },
		{ name: 'fart', file: 'fart.mp3' },
		{ name: 'kid laugh', file: 'kid-laugh.mp3' },
		{ name: 'rimshot', file: 'rimshot.mp3' },
		{ name: 'yay', file: 'yay.mp3' }
	];

	useEffect(() => {
		//
	}, []);

	const playSound = (sound) => {
		console.log(sound);
		const audio = new Audio('/files/sounds/'+ sound.file);
		audio.play();
	}

	return (
		<div id="sound-menu">
		{ sounds.map((sound, i) => {
			return <button key={i} type="button" onClick={ () => playSound(sound) }>{sound.name}</button>
		}) }
		</div>
	);
}
