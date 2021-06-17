var zip = new JSZip();

async function fetchTest(url) {
	let response = await fetch(url);
	let responseText = await response.text();

	return responseText;
}

function titleProcess (title) {
	// * : < > ? / \ | ~ ” # % & * : < > ? / \ { | } 
	const regex = /(\*)|(\:)|(\<)|(\>)|(\?)|(\/)|(\\)|(\|)|(\~)|(\”)|(\#)|(\%)|(\&)|(\*)|(\:)|(\<)|(\>)|(\{)|(\})/gm;
	let title_beauty = title.replace(regex, `-`);

	title_beauty = title_beauty.replace(/(\s)+.srt/gm,'.srt');
	title_beauty = title_beauty.replace(/(\s)+$/gm,'');
	return title_beauty;
}

function get_json(source){
	let object_json = source.match(/(<script id="__NEXT_DATA__" type="application\/json">{)+(.)+(}<\/script>)+/gm);
	let error_messenger = '';

	try {
		if (object_json === null) throw error_messenger = "Invalid Pluralsight's Source code or Pluralsight fix it!!!";
		object_json = object_json[0];

		object_json = object_json.replace(/^(<script id="__NEXT_DATA__" type="application\/json">)/gm,'');
		object_json = object_json.replace(/(<\/script>)$/gm,'');
		object_json = JSON.parse(object_json);

		return object_json;
	} 
	catch(error) {
		console.log(error);
		$("#messenger_error").html(`<p class="mb-2 text-danger">${error}</p>`);
		return {}
	}
}

function getDownloads(){
	var sourceCode = $("textarea#subtitle_input").val();
	var table_content;
	var course_title;
	var object_json = get_json(sourceCode);

	zip = new JSZip()
	
	try {
		table_content = object_json['props']['pageProps']['tableOfContents']['modules'];
		course_title = object_json['props']['pageProps']['tableOfContents']['title'];
	} 
	catch(error) {
		return error;
	}
	course_title = titleProcess(course_title);

	$("#btn_general").addClass('disabled');
	$("#btn_general").prop("onclick", null).off('click');
	$("#messenger_error").remove();
	$("#subtitle_general").empty();
	$(".click-download").remove();
	$("#subtitle_general").append(`<h2 class="mb-4">Course: ${course_title}</h2>`);
	$("#subtitle_general").append(`<ul class="table-content" id="table_content"></ul>`);
	$(".download-subtitle-form").append(`<div class="text-center"><div class="spinner-border" role="status"><span class="sr-only">Loading...</span></div></div>`);

	(async() => {
		for (let index in table_content) {
			
			let stt_subTopic = +(index) + 1;
			let title_subTopic = table_content[index]['title'];
			let folder_subTopic = '';
			let tableContent_subTopic = table_content[index]['contentItems'];

			if (index < 9 ) {
				stt_subTopic = '0' + stt_subTopic;
			} 

			folder_subTopic = `${stt_subTopic}. ${title_subTopic}`;
			folder_subTopic = titleProcess(folder_subTopic);
			
			console.log(folder_subTopic);
			$("#table_content").append(`
				<li class="sub-folder d-flex align-items-center">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" class="mr-3"><path d="M24 17h-3v-3h-2v3h-3v2h3v3h2v-3h3v-2zm-10 5h-14v-20h7c1.695 1.942 2.371 3 4 3h13v7h-2v-5h-11c-2.34 0-3.537-1.388-4.916-3h-4.084v16h12v2z"/></svg>
					<span class="d-inline-block"><strong>${folder_subTopic}</strong></span>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" class="ml-2"><path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"/></svg>
				</li>`);
			$("#table_content").append(`<ul class="list-file" id="list_file_${stt_subTopic}"></ul>`);
			
			folder_subTopic = zip.folder(folder_subTopic);

			for (let index_topic in tableContent_subTopic) {
				let stt_topic = +(index_topic) + 1;
				let id_topic = tableContent_subTopic[index_topic]['id'];
				let version_topic = tableContent_subTopic[index_topic]['version'];
				let title_topic = tableContent_subTopic[index_topic]['title'];
				let url_subtitle = `https://app.pluralsight.com/transcript/api/v1/caption/webvtt/${ id_topic }/${ version_topic }/en/`;
				let filename_subtitle;

				if (index_topic < 9 ) {
					stt_topic = '0' + stt_topic ;
				} 

				filename_subtitle = `${ stt_topic }. ${ title_topic }.srt`;
				filename_subtitle = titleProcess(filename_subtitle);
				
				data_subtitle = await fetchTest(url_subtitle);
				folder_subTopic.file(filename_subtitle, data_subtitle);

				console.log('----' + filename_subtitle );
				$("#list_file_"+stt_subTopic).append(`
					<li class="sub-file d-flex align-items-center">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" class="mr-3"><path d="M4 22v-20h16v11.543c0 4.107-6 2.457-6 2.457s1.518 6-2.638 6h-7.362zm18-7.614v-14.386h-20v24h10.189c3.163 0 9.811-7.223 9.811-9.614zm-5-1.386h-10v-1h10v1zm0-4h-10v1h10v-1zm0-3h-10v1h10v-1z"/></svg>
						<span>${filename_subtitle}</span>
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" class="ml-2"><path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"/></svg>
					</li>`);
			}
		}
		$(".download-subtitle-form .text-center .spinner-border").remove();
		
		$("#table_content").append(`
			<div class="sub-folder text-center">
				<span class="d-inline-block">Done</span>
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"/></svg>
			</div>`
		);
		var downloadBtn = `<button class="btn btn-dark mb-4 mx-2 px-4 text-uppercase click-download" onclick="downloadFile('${course_title}')"><strong>Download</strong></button>`;
		$(".download-subtitle-input").append(downloadBtn);
		$(".download-subtitle-form").append(`<div class="text-center">${downloadBtn}</div>`);
		$("#btn_general").removeClass('disabled');
		$("#btn_general").on("click", getDownloads);
	})();
}

function downloadFile(name){
	zip.generateAsync({type:"blob"})
	.then(function(content) {
		// see FileSaver.js

		saveAs(content, name+'.zip');

	});
}
