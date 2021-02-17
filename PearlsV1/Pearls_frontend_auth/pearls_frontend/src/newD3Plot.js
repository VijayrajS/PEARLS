import React from 'react'
import ReactDOM from 'react-dom'
import ParallelCoordinatesComponent from 'react-parallel-coordinates'

class PCTest extends React.Component {
	constructor (props) {
		super(props)
		this.state={
			brushing: {},
			width: props.minWidth,
			height: props.minHeight
		}
		this._bind('brushUpdated', 'handleResize');
	}
	_bind(...methods) {
		methods.forEach( (method) => this[method] = this[method].bind(this) );
	}
	debugOutput () {
		return (
			<p>Number of brushed images: {this.state.brushing.length}</p>
		)
	}
	handleResize(e) {
		let newWidth = ReactDOM.findDOMNode(this).offsetWidth;
		if (newWidth < this.props.minWidth) { newWidth = this.props.minWidth; }
		this.setState({width: newWidth});
	}
	componentDidMount() {
		this.handleResize()
		window.addEventListener('resize', this.handleResize);
	}
	componentWillUnmount() {
		window.removeEventListener('resize', this.handleResize);
	}
	brushUpdated (data) {
		this.setState({brushing: data})
	}
	render () {
		let {
			data,
			dimensions, // array of objects; compare format: http://bl.ocks.org/syntagmatic/0d1635533f6fb5ac4da3
			initialBrushExtents, // set initial brush extents, change them with ??? ParallelCoordinatesComponent. ???
			onBrush_extents, // this is called with current brush extents
			onBrushEnd_extents, // same
			onBrushEnd_data, // this is called with the complete data of all brushed items
		} = this.props



		return (
			<div>
				<ParallelCoordinatesComponent data={data} height={this.state.height} width={this.state.width}
					dimensions={dimensions}
					dimensionTitleRotation={-50}
					initialBrushExtents={initialBrushExtents}
					onBrush_extents={onBrush_extents} onBrushEnd_extents={onBrushEnd_extents} onBrushEnd_data={this.brushUpdated} />
				<div className='debugOutput'>{this.debugOutput()}</div>
			</div>
		)
	}
}



