describe('isFrom2010', function () {

	it('should return false for an old album', function () {
		var result = isFrom2010("Talking Heads", "Stop Making Sense");
		expect(result).toEqual(false);
	});

	it('should return true for Toro y Moi - Causers of This', function () {
		var result = isFrom2010("Toro y Moi", "Causers of This");
		expect(result).toEqual(true);
	});

});
	
