export { create_tokenizer, delete_key_value, encode, decode }


// -------------------------------------------------

async function create_tokenizer(input_text) {
	
	var csvDataset = await convert_text_to_csv(input_text);
	console.log("csvDataset: ", csvDataset);
	
	var xs = await preprocess_xs(csvDataset);
	console.log("xs: ", xs);
	
	var tokenizer = await tokenize_X(xs);
	console.log("tokenizer: ", tokenizer);
	
	return [xs, tokenizer];
}

// -------------------------------------------------

async function delete_key_value(tokenizer_obj, key_names_str) {

	key_names_str = key_names_str.replace(/\s+/g, " ");
	key_names_str = key_names_str.replace(/,\s/g, ",");
	key_names_str = key_names_str.replace(/\s,/g, ",");
	// console.log("key_names_str: ", key_names_str);

	var key_names_arr = key_names_str.split(",");
	// console.log("key_names_arr: ", key_names_arr);

	for (let i=0; i<key_names_arr.length; i++) {
		delete tokenizer_obj[key_names_arr.at(i)];
	}

	// Re-name the values from 0 to n
	var tokenizer_obj_modified = {};
	Object.keys(tokenizer_obj).map((val, ind) => { tokenizer_obj_modified[val] = ind; })
	// console.log("tokenizer_obj_modified: ", tokenizer_obj_modified)
	
	return tokenizer_obj_modified;
}

// -------------------------------------------------

async function encode(xs, tokenizer_obj) {
    
    var xs_encoded = [];
    
    for (let i=0; i<xs.length; i++) {

        var xs_final_str = xs.at(i).replace(/\s+/g, ' '); // make repeated space only one space
        xs_final_str = xs_final_str.replace(/^\s+|\s+$/g, ''); // remove spaces at the beginning and end
        // console.log("xs_final_str: ", xs_final_str)

        // Convert string to array
        var xs_final_arr = xs_final_str.split(' ');
        
        // Way 1 - work with string array and loop over every entry : use map
        var xs_tokens = xs_final_arr.map((val, ind) => { 
            return tokenizer_obj[val] ?? tokenizer_obj['<OOV>']; 
        });
        // console.log("xs_tokens: ", xs_tokens)
        
        xs_encoded.push(xs_tokens)
    }
    return xs_encoded;
}

// -------------------------------------------------

async function decode(xs_tokens, tokenizer_obj) {
    
    var xs_decoded = [];

    // Invert the keys with the values for the tokenizer
    var tokenizer_obj_inverted = {};
    Object.entries(tokenizer_obj).map(([key, value]) => { tokenizer_obj_inverted[value] = key; });
    
    for (let i=0; i<xs_tokens.length; i++) {
        
        // Way 1 - work with string array and loop over every entry : use map
        var xs = xs_tokens.at(i).map((val, ind) => { return tokenizer_obj_inverted[val]; });
        // console.log("xs: ", xs)
        
        var xs_final = xs.join(' ');
        // console.log("xs_final: ", xs_final)
            
        xs_decoded.push(xs_final)
    }
    return xs_decoded;
}

// -------------------------------------------------

async function convert_text_to_csv(input_text) {

	var sentences = input_text.split(".");
	// console.log("sentences: ", sentences);
  
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

	return await create_tokenizer_dict(uniqueArray);
}

// -------------------------------------------------


async function create_tokenizer_dict(uniqueArray) {

	// console.log("uniqueArray: ", uniqueArray);
	
	// [0] Sort uniqueArray by an attribute (ie: length)
	let arr = uniqueArray;
	var c = 0;
	while (c != arr.length-1) {
		 c = 0;
		  for (var i=0; i<arr.length-1; i++) {
			let cur = arr[i];
			  let next = arr[i+1];
			  let cur_value = cur.length;
			  let next_value = next.length;
			  
			  if (cur_value < next_value) {
				  let temp_cur = arr[i];
				  let temp_next = arr[i+1]; // want the old value of arr[i+1]
				  arr[i+1] = temp_cur;
				  arr[i] = temp_next;
			  } else {
				  //this will be some value from 1 to arr.length-1
				  c = c + 1;
				  // c = arr.length-1 means that sorting is finished
			  }
		  }
	}
	// console.log("arr: ", arr);
  
	// [1] Make a dictionary where each key is a word in arr, and each value is index
	// Create a dictionary from one array
	let tokenizer_obj = Object.fromEntries(arr.map((word, index) => { 
		return [word.replace(/[,.]/g, '').toString(), index]; 
	} ));

	return tokenizer_obj;
}

// ----------------------------------------------------
