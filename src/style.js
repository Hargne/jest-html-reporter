module.exports = () =>`
	html,body {font-family:Arial,Helvetica,sans-serif;font-size:1rem;margin:0;padding:0;color:#333;}
	body {padding:1rem;2rem;font-size:0.85rem;}
	#timestamp {font-weight:bold;color:#666;margin-bottom:0.5rem;}
	#summary {color:#999;margin-bottom:1em;}
	.suite-info {padding:1em;background-color:#eee;border-bottom:2px solid #999;font-weight:bold;color:#999;}
	.suite-table {width:100%;font-size:0.85rem;margin-bottom:1em;}
	.suite-table td {padding:0.5rem;}
	.suite-table tr.passed {background-color:#DFF2BF;color:#4F8A10;}
	.suite-table tr.pending {background-color:#FEEFB3;color:#9F6000;}
	.suite-table tr.failed {background-color:#FFBABA;color:#D8000C;}
	.suite-table td {font-size:0.85rem;border-bottom:1px solid #aaa;vertical-align:top;}
	.suite-table td.suite {font-weight:bold;width:20%;}
	.suite-table td.test {font-style:italic;width:60%;}
	.suite-table td.test .failureMsg {font-weight:bold;font-size:0.7rem;}
	.suite-table td.result {width:20%;text-align:right;}
`;
