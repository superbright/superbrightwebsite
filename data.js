
module.exports = {
  
	projects :  
				[
					{
						'title' : 'project 1',
						'description' : 'project 1 description',
						'descriptionshort' : 'project 1 descriptionshort',
						'header' : {
							'type' : 'video',
							'url' : 'xxx'
						},
						'images' : [
							'image1.jpg','image2.jpg'
						],
						'tagids' : [
							10000, 10001
						]
					},
					{
						'title' : 'project 2',
						'description' : 'project 2 description',
						'descriptionshort' : 'project 2 descriptionshort',
						'header' : {
							'type' : 'video',
							'url' : 'xxx'
						},
						'images' : [
							'image1.jpg','image2.jpg'
						],
						'tagids' : [
							10000
						]
					},
					{
						'title' : 'project 3',
						'description' : 'project 3 description',
						'descriptionshort' : 'project 3 descriptionshort',
						'header' : {
							'type' : 'video',
							'url' : 'xxx'
						},
						'images' : [
							'image1.jpg','image2.jpg'
						],
						'tagids' : [
							10002
						]
					}
				],

	tags : [
			{
				"name" : "tag1",
				"id" : 10000,
				"description" : "omg this tag rules"
			},
			{
				"name" : "tag2",
				"id" : 10001,
				"description" : "omg this tag rules"
			},
			{
				"name" : "tag3",
				"id" : 10002,
				"description" : "omg this tag rules"
			}
	],

	getTagfromID: function(id) {
		var foundtag = "none";
		this.tags.forEach(function(tag) {
			if(tag.id === id) {
				foundtag = tag;
			}
		});

		return foundtag;
	},
	getTagfromTagname: function(name) {
		var foundtag = "none";
		this.tags.forEach(function(tag) {
			if(tag.name === name) {
				foundtag = tag;
			}
		});

		return foundtag;
	},
	getProjectfromTagID: function(id) {
		var foundprojects = [];
		this.projects.forEach(function(project) {
			if(project.tagids.indexOf(id) >= 0) {
				foundprojects.push(project);
			}
		});

		return foundprojects;
	}

};



