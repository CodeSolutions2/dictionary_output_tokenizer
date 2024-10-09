export { tokenize_data, delete_key_value, randomize_tokenNumber }


// -------------------------------------------------

async function tokenize_data(input_text){
  
  var csvDataset = await convert_text_to_csv(input_text);
    var xs = await preprocess_xs(csvDataset);
	  return await tokenize_X(xs);
}

// -------------------------------------------------

async function delete_key_value(tokenizer_obj, key_name){
	delete tokenizer_obj.key_name;
	return tokenizer_obj;
}

// -------------------------------------------------

async function randomize_tokenNumber(tokenizer_obj){

	const x = Array.from({ length: Object.keys(tokenizer_obj).length }, (val, ind) => { return ind; });
	const x_rand = await rand_perm(x);
	
	var tokenizer_obj_rand = {};
	Object.keys(tokenizer_obj).map((val, ind) => { tokenizer_obj_rand[val] = x_rand[ind]; return ''; });
	
	return tokenizer_obj_rand;
}

// ----------------------------------------------------

async function get_number(x) {
	return x[Math.round(x.length*Math.random())-1];
}
	  
export async function rand_perm(x) {

	var out = [];
	while (out.length != x.length) {
		out = await get_number(x).then(async function(x_of_y) {
			if (out.includes(x_of_y) == false && typeof x_of_y != "undefined") { 
				out.push(x_of_y);
			}
			return [... new Set(out)]; // ensure that only unique values are stored in out
		});
	}
	
	return out;
	
}  // end of rand_perm

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
	var c = 0;
	while (c != arr.length-1) {
		 c = 0;
		  for (var i=0; i<arr.length-1; i++) {
			let cur = arr[i];
			  let next = arr[i+1];
			  let cur_value = cur.length;
			  let next_value = next.length;
			  
			  if (cur_value < next_value) {
				  let temp_cur = arr[i]
				  let temp_next = arr[i+1]; // want the old value of arr[i+1]
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
