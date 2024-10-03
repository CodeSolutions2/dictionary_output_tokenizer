export { tokenize_data }


// -------------------------------------------------

async function tokenize_data(input_text){
  
  var csvDataset = await convert_text_to_csv(input_text);
    var xs = await preprocess_xs(csvDataset);
	  return await tokenize_X(xs);
}

// -------------------------------------------------

async function convert_text_to_csv(input_text) {

  var sentences = input_text.split(".");
  console.log("sentences: ", sentences);
  
  var csvDataset = [];
for (var i=0; i<sentences.length; i++) {
  var tf_obj = {xs: sentences.at(i), ys: "none"};
  csvDataset.push(tf_obj);
}

  return csvDataset;
}

// -------------------------------------------------

async function preprocess_xs(csvDataset) {

	  //const tensors = await csvDataset.toArray();

	  var X = '';
	  var xs = [];

	  csvDataset.forEach(async function(rowdata, index) {

		console.log("rowdata.xs: ", rowdata.xs);
		  
		 // ---------------------------
		 // Clean text procedure
		 // ---------------------------
		 // Make text lower case, Remove characters between parenthesis, Remove text that are 1 or 2 characters long, Remove undesireable characters
		 X = Object.values(rowdata.xs).toString().toLowerCase().replace(/\((.*?)\)/g, '').replace(/\{(.*?)\}/g, '').replace(/\[(.*?)\]/g, '').replace(/[/\/\n]/g, ' ').replace(/[\.\€\$\£\%\d,\[\]\(\)\{\}\!-><\n]/g, '').replace(/(?<=\s)[A-Za-z]{1,2}(?=\s)/g, '');  
		
		  // ---------------------------
		  // Verify that data is correct, and only keep correct X and Y data
		  // if (X.length-1 > 10){ xs.push(X); }
		  xs.push(X);

	  });  // end of forEach


		console.log("xs: ", xs);
	
	  return xs;
  }


  // -------------------------------------------------

	


	
// -------------------------------------------------
// SUBFUNCTIONS
// -------------------------------------------------
async function tokenize_X(xs) {
	
	// ---------------------------
	
	// Concatenate the array contents into a long text string
	
	// Initialize with first array
	let final_str = xs.slice(0,1);
	let xs_rest = xs.slice(1, xs.length);
	
	xs_rest.forEach(async function(val, ind) { 
		final_str = final_str.concat(val); // string
	});

	final_str = final_str.toString();
	
	// ---------------------------
	
	// Replace any multiple spaces from accumulatted string with only a single space
	final_str = final_str.replace(/\s+/g, ' ');
	
	// ---------------------------

	// Split the accumulatted string
	let final_arr = final_str.split(" ");

	// ---------------------------

	// Find unique words
	let uniqueArray = [...new Set(final_arr)];

	// Add the <OOV> token: if the word is not in the token list assign this value
	uniqueArray.push('<OOV>');
	
	// ---------------------------

	var tokenizer = await create_tokenizer_dict(uniqueArray);

	return tokenizer;
	
}

// -------------------------------------------------

async function create_tokenizer_dict(uniqueArray) {
  
	// [0] Sort uniqueArray by an attribute (ie: length)
	let arr = uniqueArray;
	c = 0;
	while (c != arr.length-1) {
		 c = 0;
		  for (var i=0; i<arr.length-1; i++) {
			let cur = arr[i];
			  let next = arr[i+1];
			  let cur_value = cur.length;
			  let next_value = next.length;
			  
			  if (cur_value < next_value) {
				  temp_cur = arr[i]
				  temp_next = arr[i+1]
				  arr[i+1] = temp_cur
				  arr[i] = temp_next
			  } else {
				  //this will be some value from 1 to arr.length-1
				  c = c + 1;
				  // c = arr.length-1 means that sorting is finished
			  }
		  }
	}
	  
  
	// [1] Make a dictionary where each key is a word in arr, and each value is index
	// Create a dictionary from one array
	 return Object.fromEntries(arr.map((word, index) => [word, index]));
}

// -------------------------------------------------
