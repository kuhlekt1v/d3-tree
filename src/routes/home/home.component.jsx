import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Tree from 'react-d3-tree';
import * as d3 from 'd3';

import './home.styles.scss';
import { tree } from 'd3';

const initialData = {
	name: 'Process Control',
	children: [
		{
			name: 'Core Tools',
			children: [
				{
					name: 'PFMEA',
				},
				{
					name: 'Control Plan',
				},
				{
					name: 'Data Collection Plan',
				},
				{
					name: 'MSA',
				},
				{
					name: 'Control & Capability',
				},
			],
		},
		{
			name: 'SPC System',
			children: [
				{
					name: 'Ignition',
					children: [
						{ name: 'Data Tagging' },
						{ name: 'Operator Dashboard Development' },
						{ name: 'Auto Andons' },
						{ name: 'Manual Andons' },
						{ name: 'Install', link: 'https://google.com' },
					],
				},
			],
		},
	],
};

// Base URL for remote data.
const client = axios.create({
	baseURL: 'rawData.json',
});

const Home = () => {
	const [data, setData] = useState({});

	// Convert d3 hierarchy to nested JSON.
	// Works but need to figure out to attach links.
	const hierarchyToJson = root => {
		const obj = { name: root.id, link: root.data.link };
		//console.log(obj);
		if (root.children) obj.children = root.children.map(hierarchyToJson);
		//console.log(obj.children);
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

				console.log(hierarchy);

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
				initialDepth={0}
				zoomable={false}
				collapsible={true}
				leafNodeClassName='node__leaf'
				className='tree'
				translate={{ x: 50, y: size.y / 2 }}
			/>
		</div>
	);
};

export default Home;
