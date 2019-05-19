import React from 'react';

//declare var alt: any;
import '../styles/inventory.scss';

const no_img = require('../img/image.svg');

import items_data from './../items.json';


function translateName(name: string) {
	//@ts-ignore
	let item_dt: [string, string] = items_data[name];
	if(item_dt)
		return item_dt[0] || name;
	return name;
}

interface ItemSchema {
	name: string;
	amount: number;
	usable: boolean;
}

const CATEGORIES = {//dictionary
	'ALL': 'WSZYSTKIE',
	'WEAPONS': 'BRONIE'
};

interface HomeState {
	pos: {x: number, y: number};
	category: string;
	items: ItemSchema[];
}

export default class Home extends React.Component<any, HomeState> {
	private container: HTMLDivElement | null = null;
	private centered = true;
	private grabPos: {x: number, y: number} | null = null;

	state: HomeState = {
		pos: {x: 0, y: 0},
		category: Object.keys(CATEGORIES)[0],
		items: []
	}

	constructor(props: any) {
		super(props);
	}

	componentDidMount() {
		this.centerContainer();

		window.addEventListener('mousemove', this.onMouseMove.bind(this), true);
		window.addEventListener('mouseup', this.onMouseReleased.bind(this), true);

		if(process.env.NODE_ENV === 'development') {
			let arr: ItemSchema[] = [];
			for(let i=0; i<100; i++) {
				arr.push({
					name: 'costam' + i, 
					amount: (Math.random()*10000)|0, 
					usable: Math.random() > 0.5
				});
			}
			this.setState({items: arr});
		}
	}

	componentWillUnmount() {
		window.removeEventListener('mousemove', this.onMouseMove.bind(this), true);
		window.removeEventListener('mouseup', this.onMouseReleased.bind(this), true);
	}

	componentDidUpdate() {
		if(this.centered)
			this.centerContainer();
	}

	onMouseMove(e: MouseEvent) {
		if(this.grabPos !== null && this.container) {
			this.centered = false;

			let dx = e.clientX - this.grabPos.x,
				dy = e.clientY - this.grabPos.y;
			let rect = this.container.getBoundingClientRect();
			this.setState({pos: {
				x: Math.min(window.innerWidth-rect.width, Math.max(0, this.state.pos.x + dx)),
				y: Math.min(window.innerHeight-rect.height, Math.max(0, this.state.pos.y + dy))
			}});
			this.grabPos.x = e.clientX;
			this.grabPos.y = e.clientY;
		}
	}

	onMouseReleased() {
		this.grabPos = null;

		//TODO - save this.state.pos to localStorage
	}

	onHeaderGrab(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
		this.grabPos = {x: e.clientX, y: e.clientY};
	}

	private centerContainer() {
		if(!this.container)
			return;

		let rect = this.container.getBoundingClientRect();

		let new_x = (window.innerWidth - rect.width) / 2,
			new_y = (window.innerHeight - rect.height) / 2;

		if(this.state.pos.x !== new_x || this.state.pos.y !== new_y)
			this.setState({pos: {x: new_x, y: new_y}});
	}

	renderItemEntry(item: ItemSchema, index: number) {
		//item.usable
		//@ts-ignore
		let item_dt = items_data[item.name];
		let icon = no_img;
		if(item_dt)
			icon = item_dt[1] || no_img;

		return <div key={index} className='item-entry'>
			<img className='icon' src={icon} onError={e => {
				//@ts-ignore
				e.nativeEvent.target.src = no_img;
			}} />
			<div className='name'>{translateName(item.name)}</div>
			<div className='amount'>{item.amount}</div>
		</div>;
	}

	render() {
		return <div className='inventory' ref={el => this.container = el} style={{
			left: this.state.pos.x + 'px',
			top: this.state.pos.y + 'px'
		}}>
			<header>
				<span onMouseDown={this.onHeaderGrab.bind(this)}></span>
				<div onMouseDown={this.onHeaderGrab.bind(this)}>
					EKWIPUNEK
				</div>
				<button className='closer'></button>
			</header>
			<nav className='categories' style={{
				gridTemplateColumns: Object.keys(CATEGORIES).map(()=>'1fr').join(' ')
			}}>
				{Object.entries(CATEGORIES).map((entry, i) => {
					let [cat, cat_name] = entry;
					return <button key={i} className={this.state.category === cat ? 'current' : ''} 
						onClick={() => this.setState({category: cat})}>{cat_name}</button>;
				})}
			</nav>
			<section className='items-list'>
				{this.state.items.map(this.renderItemEntry.bind(this))}
			</section>
			<footer>
				<span>Ilość przedmiotów: 69/1337</span>
			</footer>
		</div>;
	}
}