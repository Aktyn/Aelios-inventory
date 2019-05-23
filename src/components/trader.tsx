import React from 'react';
import {ItemSchema, PlayerSchema} from './home';

interface TraderProps {
	item: ItemSchema;
	players: PlayerSchema[];
	onCancel: () => void;
	onConfirm: (player: PlayerSchema, item: ItemSchema, amount: number) => void;
}

interface TraderState {
	chosen_player?: PlayerSchema;
	error_msg?: string;
}

const darkerbg = {backgroundColor: '#263238'};

export default class Trader extends React.Component<TraderProps, TraderState> {
	private amount_input: HTMLInputElement | null = null;
	private give_confirm: NodeJS.Timeout | null = null;

	state: TraderState = {}

	constructor(props: TraderProps) {
		super(props);
	}

	componentDidMount() {
		if(this.props.players.length === 1)//if there is no much of a choice
			this.setState({chosen_player: this.props.players[0]});//choice only option
	}

	componentWillUnmount() {
		if(this.give_confirm)
			clearTimeout(this.give_confirm);
	}

	private tryGive() {
		if(!this.amount_input)
			return;
		if(!this.state.chosen_player) {
			this.setState({error_msg: 'Nie wybrano gracza'});
			return;
		}

		if(this.give_confirm) {
			this.props.onConfirm(this.state.chosen_player, this.props.item, 
				parseInt(this.amount_input.value));
			return;
		}
	
		this.give_confirm = setTimeout(() => {
			this.give_confirm = null;
			this.forceUpdate();
		}, 5000) as never;
		this.forceUpdate();
	}

	render() {
		return <div className='trader'>
			<h2 style={darkerbg}>GRACZE W POBLIŻU</h2>
			<table className='neighbour-players'><tbody>
				<tr style={darkerbg}><th>Id</th><th>Nick</th></tr>
				{this.props.players.map((player, i) => {
					return <tr className={this.state.chosen_player === player ? 'chosen' : ''}
						onClick={() => this.setState({chosen_player: player})} key={i}>
						<td>{player.id}</td>
						<td>{player.nick}</td>
					</tr>;
				})}
			</tbody></table>
			<hr style={{marginTop: '0px'}} />
			<div>
				<input type='number' defaultValue={"1"} min={1} max={this.props.item.amount} 
				placeholder='Ilość' ref={el => this.amount_input = el} />
				<span>/ {this.props.item.amount}</span>
			</div>
			<span className='error-msg'>{this.state.error_msg}</span>
			<button onClick={this.tryGive.bind(this)}>
				{this.give_confirm ? 'NA PEWNO?' : 'PRZEKAŻ'}
			</button><br/>
			<button onClick={this.props.onCancel}>ANULUJ</button>
		</div>;
	}
}