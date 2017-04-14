function ClozeCard( fullText, cloze ) {
	if( !fullText.includes( cloze ) ){
		return {invalid: true};
	}
	else{
		this.fullText = fullText;
		this.cloze = cloze;
		this.partial = fullText.replace( cloze, '...');
		
	}
}

module.exports = ClozeCard;