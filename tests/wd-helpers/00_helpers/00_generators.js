function *generator1() {
	t.setTitle('Test for generator runner');
	l.println(yield gT.sOrig.promise.delayed(2000));
	l.println(yield gT.sOrig.promise.delayed(2000));
	l.println(yield gT.sOrig.promise.fulfilled("Success"));
	l.println(yield gT.sOrig.promise.rejected("Intentionaly rejected promise"));
	l.println('This string should not be in log');
	l.println(yield gT.sOrig.promise.delayed(2000));
  yield 'Test done';
}

u.execGen(generator1);

