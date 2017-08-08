module.exports = () =>`
	function toggleImg(e, id) {
    document.getElementById(id).classList.toggle("hide");
    document.getElementById(id+'show').classList.toggle("hide");
  }
`;