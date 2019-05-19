import React from 'react';

//declare var alt: any;

interface HomeState {
	
}

export default class Home extends React.Component<any, HomeState> {
	state: HomeState = {
		
	}

	constructor(props: any) {
		super(props);
	}

	render() {
		return <div className='home-main'>INVENTORY</div>;
	}
}