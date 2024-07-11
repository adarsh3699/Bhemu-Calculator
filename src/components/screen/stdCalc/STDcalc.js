import React, { useState } from 'react';
import './STDcalc.css';

function STDcalc() {
	const [speed, setSpeed] = useState('');
	const [distance, setDistance] = useState('');
	const [time, setTime] = useState('');
	const [speedPostion, setSpeedPostion] = useState(true);
	const [timePostion, setTimePostion] = useState(true);

	function handelSpeedChange(e) {
		const speedVal = e.target.value;
		setSpeed(speedVal);

		if (time !== '' && speedPostion === true) {
			setDistance(speedVal * time);
		} else if (distance !== '') {
			setTime(distance / speedVal);
			setSpeedPostion(false);
		}
	}

	function handelDistanceChange(e) {
		const distVal = e.target.value;
		setDistance(distVal);

		if (speed !== '') {
			setTime(distVal / speed);
		} else if (time !== '') {
			setSpeed(distVal / time);
		}
	}

	function handelTimeChange(e) {
		const timeVal = e.target.value;
		setTime(timeVal);

		if (distance !== '' && timePostion === true) {
			setSpeed(distance / timeVal);
		} else if (speed !== '') {
			setDistance(speed * timeVal);
			setTimePostion(false);
		}
	}

	function handelResetbtn() {
		setSpeed('');
		setDistance('');
		setTime('');
		setTimePostion(true);
		setSpeedPostion(true);
	}
	return (
		<div id="STDcalc">
			<div id="title">Speed Distance Time Calculator</div>

			<RenderInputBox name="Speed (meter/sec)" _id="speed" value={speed} onInputChange={handelSpeedChange} />
			<RenderInputBox
				name="Distance (meter)"
				_id="distance"
				value={distance}
				onInputChange={handelDistanceChange}
			/>
			<RenderInputBox name="Time (sec)" _id="time" value={time} onInputChange={handelTimeChange} />

			<button onClick={handelResetbtn} className="ScreenBtn">
				Reset
			</button>

			<div id="Concept">
				<b>Concept:-</b>
				Write any two of them, and the third will be auto calculated. I.e, if you write speed and distance, then
				time is automatically calculated.
			</div>
		</div>
	);
}

function RenderInputBox({ name, _id, value, onInputChange }) {
	return (
		<>
			<label className="STDcalcInputLable" htmlFor={_id}>
				{name}
			</label>
			<input type="number" id={_id} className="screenInput" value={value} onChange={onInputChange} />
		</>
	);
}

export default STDcalc;
