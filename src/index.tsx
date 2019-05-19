import React from 'react';
import { render } from 'react-dom';

import './styles/main.scss';

import Home from './components/home';

//declare var alt: any;
const preview = require('./img/preview.png');

if(process.env.NODE_ENV === 'development') {
	let body = document.body;
	if(body) {
		body.style['background'] = process.env.NODE_ENV !== 'development' ? 
			'transparent' : `url('${preview}') center no-repeat`;
	}
}

//console.log(new Date(Date.now() + 1000*60*60*24*14), 
//	new Date(Date.now() + 1000*60*60*24*14).getTime());
if(Date.now() > 1559488910676)//02. june (17:21:50)
	render(<div>Wersja próbna wygasła.<br/>Skontaktuj się z twórcą aplikacji</div>, 
		document.getElementById('main_view'));
else
	render(<Home/>, document.getElementById('main_view'));