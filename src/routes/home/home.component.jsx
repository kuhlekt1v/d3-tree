import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Tree from 'react-d3-tree';
import * as d3 from 'd3';

import './home.styles.scss';

// Base URL for remote data.
const client = axios.create({
	baseURL: 'rawData.json',
});

const renderNodeWithCustomEvents = ({
	nodeDatum,
	toggleNode,
	handleLinkClick,
}) => (
	<g>
		<foreignObject x='0' height='120px' width='500px' y='-60px'>
			<div
				title={nodeDatum.name}
				className={`elemental-node ${
					nodeDatum.link ? 'link-node' : 'normal-node'
				}`}
				onClick={toggleNode}
			>
				<span title={nodeDatum.name}>
					<p style={{ margin: 0 }}>{nodeDatum.shortName}</p>
					{nodeDatum.link && (
						<p className='doc-link' onClick={() => handleLinkClick(nodeDatum)}>
							Document Link
						</p>
					)}
				</span>
			</div>
		</foreignObject>
	</g>
);

const Home = () => {
	const handleLinkClick = nodeDatum => {
		window.open(nodeDatum.link, '_blank');
	};

	const [data, setData] = useState({});

	// Convert d3 hierarchy to nested JSON.
	const hierarchyToJson = root => {
		let shortName =
			root.id.length >= 15 ? root.id.substr(0, 15) + '..' : root.id;

		const obj = { name: root.id, link: root.data.link, shortName: shortName };
		if (root.children) obj.children = root.children.map(hierarchyToJson);

		if (root.data && root.data.value) obj.value = root.data.value;
		return obj;
	};

	useEffect(() => {
		const getData = async () => {
			try {
				const response = await client.get();

				// Convert flat json to d3 hierarchy for tree.
				let root = d3
					.stratify()
					.id(d => d.name)
					.parentId(d => d.parent)(response.data);

				// Create nested JSON.
				let hierarchy = hierarchyToJson(root);
				setData(hierarchy);
			} catch (error) {
				console.log(error);
			}
		};
		getData();
	}, []);

	const [size, setSize] = useState({
		x: window.innerWidth,
		y: window.innerHeight,
	});

	const updateSize = () =>
		setSize({
			x: window.innerWidth,
			y: window.innerHeight,
		});

	useEffect(() => (window.onresize = updateSize), []);

	return (
		<div className='container'>
			<Tree
				data={data}
				renderCustomNodeElement={rd3tProps =>
					renderNodeWithCustomEvents({ ...rd3tProps, handleLinkClick })
				}
				initialDepth={0}
				zoomable={false}
				translate={{ x: 50, y: size.y / 2 }}
				nodeSize={{ x: 350, y: 200 }}
				separation={{ siblings: 1, nonSiblings: 1.5 }}
			/>
		</div>
	);
};

export default Home;
