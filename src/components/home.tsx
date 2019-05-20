import React from 'react';

declare var alt: any;

import '../styles/inventory.scss';
import items_data from '../items.json';
const no_img = require('../img/image.svg');

//@ts-ignore
var req = require.context("../img/item_icons", true, /^(.*\.(png|jpe?g|svg|gif|bmp$))[^.]*$/im);
req.keys().forEach(function(key: string) {
	req(key);
});

function translateName(name: string) {
	//@ts-ignore
	let item_dt: [string, string] = items_data[name];
	if(item_dt)
		return item_dt[0] || name;
	return name;
}

interface ItemSchema {
	id: number;
	item_name: string;
	amount: number;
	category_name: string;
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
	hovered_item_i: number;
}

export default class Home extends React.Component<any, HomeState> {
	private container: HTMLDivElement | null = null;
	private items_list: HTMLDivElement | null = null;
	private centered = true;
	private grabPos: {x: number, y: number} | null = null;

	state: HomeState = {
		pos: {x: 0, y: 0},
		category: Object.keys(CATEGORIES)[0],
		items: [],
		hovered_item_i: 0
	}

	constructor(props: any) {
		super(props);
	}

	componentDidMount() {
		this.centerContainer();

		window.addEventListener('mousemove', this.onMouseMove.bind(this), true);
		window.addEventListener('mouseup', this.onMouseReleased.bind(this), true);
		window.addEventListener('keydown', this.onKeyDown.bind(this), true);

		if(process.env.NODE_ENV === 'development') {
			let cats = Object.keys(CATEGORIES);
			let arr: ItemSchema[] = [];
			for(let i=0; i<92; i++) {
				arr.push({
					id: i,
					item_name: Object.keys(items_data)[i], 
					amount: (Math.random()*10000)|0, 
					usable: Math.random() > 0.5,
					category_name: cats[(Math.random()*cats.length)|0]
				});
			}
			this.loadItems(arr);
		}
		else {
			try {
				alt.emit('viewLoaded');

				alt.on('toogle_inventory_display', (show: boolean) => {
					let main_view = document.getElementById('main_view');
					if(!main_view)
						return;
					if(show) {
						main_view.style.display = 'block';
						if(this.centered)
							this.centerContainer();
					}
					else
						main_view.style.display = 'none';
				});

				alt.on('loadItems', (items: ItemSchema[]) => {
					this.loadItems(items);
				});
			}
			catch(e) {
				console.warn(e);
			}
		}
	}

	loadItems(items: ItemSchema[]) {
		this.setState({items});
	}

	componentWillUnmount() {
		window.removeEventListener('mousemove', this.onMouseMove.bind(this), true);
		window.removeEventListener('mouseup', this.onMouseReleased.bind(this), true);
		window.removeEventListener('keydown', this.onKeyDown.bind(this), true);
	}

	componentDidUpdate() {
		if(this.centered)
			this.centerContainer();
	}

	onKeyDown(e: KeyboardEvent) {
		switch(e.keyCode) {
			case 38: //arrow up
			case 40: {//arrow down
				var new_hover_i = (this.state.hovered_item_i+(e.keyCode===38 ? -1 : 1));
				let jumped = false;
				if(new_hover_i < 0) {
					jumped = true;
					new_hover_i = this.state.items.length-1;
				}
				else if(new_hover_i >= this.state.items.length) {
					jumped = true;
					new_hover_i = 0;
				}
				this.setState({
					hovered_item_i: new_hover_i
				});
				e.preventDefault();
				let hovered: HTMLDivElement | null = document.querySelector('.item-entry.hovered');
				if(hovered && this.items_list) {
					if(jumped) {
						this.items_list.scrollTop = hovered.offsetTop - 
							(e.keyCode === 40 ? hovered.offsetHeight*1.5 : 0);
					}
					else if(e.keyCode === 40) {
						this.items_list.scrollTop = Math.max(this.items_list.scrollTop,
							hovered.offsetTop - this.items_list.offsetHeight);
					}
					else {
						this.items_list.scrollTop = Math.min(this.items_list.scrollTop,
							hovered.offsetTop - hovered.offsetHeight*1.5);
					}
					//console.log(this.items_list.scrollTop);
					
				}
			}	break;
			case 13://enter

				break;
		}
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
		let item_dt = items_data[item.item_name];
		let icon = no_img;
		if(item_dt)
			icon = item_dt[1] || no_img;

		return <div key={index} className={`item-entry${
			this.state.hovered_item_i===index ? ' hovered' : ''}`} onMouseEnter={() => {
				this.setState({hovered_item_i: index});
			}}>
			<img className='icon' src={icon} onError={e => {
				//@ts-ignore
				e.nativeEvent.target.src = no_img;
			}} />
			<div className='name'>{translateName(item.item_name)}</div>
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
				<div className='title' onMouseDown={this.onHeaderGrab.bind(this)}>
					EKWIPUNEK
				</div>
				<button className='closer' onClick={() => {
					try {
						alt.emit('onInventoryClose');
					}
					catch(e) {}
				}}></button>
			</header>
			<nav className='categories' style={{
				gridTemplateColumns: Object.keys(CATEGORIES).map(()=>'1fr').join(' ')
			}}>
				{Object.entries(CATEGORIES).map((entry, i) => {
					let [cat, cat_name] = entry;
					let current_cat = this.state.category === cat;
					return <button key={i} className={current_cat ? 'current' : ''} 
						onClick={() => this.setState({category: cat})}>{cat_name}</button>;
				})}
			</nav>
			<div className='items-list' ref={el => this.items_list = el}>
				{this.state.items.length === 0 ? 'PUSTO' : this.state.items.map((item, i) => {
					if(this.state.category === item.category_name || 
						this.state.category === Object.keys(CATEGORIES)[0])
					{
						return this.renderItemEntry(item, i);
					}
					else
						return undefined;
				})}
			</div>
			<footer>
				<span>Ilość przedmiotów: {this.state.items.length}</span>
			</footer>
		</div>;
	}
}