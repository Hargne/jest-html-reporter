module.exports = () => `
	html, body {
		font-family: Arial, Helvetica, sans-serif;
		font-size: 1rem;
		margin: 0;
		padding: 0;
		color: #333;
	}
	body {
		padding: 1rem 2rem;
		font-size: 0.85rem;
	}
	#timestamp {
		font-weight: bold;
		color: #666;
		margin-bottom: 1rem;
	}
	#summary-table {
		width: 100%;
		margin-bottom: 1rem;
		font-size: 1rem;
		background-color: #eee;
		border-bottom: 3px solid #ccc;
	}
	#summary-table td {
		text-align: center;
		padding: 0.5rem;
	}
	#result-table {
		width: 100%;
		font-size: 0.85rem;
		border-bottom: 3px solid #666;
	}
	#result-table th, #result-table td {
		padding: 0.5rem;
	}
	#result-table th {
		background-color: #eee;
		text-align: left;
		border-bottom: 2px solid #ccc;
	}
	#result-table tr.passed {
		background-color: #DFF2BF;
		color: #4F8A10;
	}
	#result-table tr.pending {
		background-color: #FEEFB3;
		color: #9F6000;
	}
	#result-table tr.failed {
		background-color: #FFBABA;
		color: #D8000C;
	}
	#result-table td {
		font-size: 0.8rem;
		border-bottom: 1px solid #aaa;
	}
	#result-table td.suite {
		font-weight: bold;
	}
`;
