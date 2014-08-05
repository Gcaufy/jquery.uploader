/*!
 * Note: Using iframe to do a fake ajax upload
 *
 * jQuery Uploader Library v1.0.1
 * http://www.madcoder.cn/
 *
 * Copyright 2014, Gcaufy
 *
 * Date Fri Aug 01 2014 15:34:13 GMT+0800
 */
(function ($){
	var uploader = function (dom, i, c) {
		this.uploadButton = dom;
		this.index = i;
		this.files = [];
		this.config = $.uploader.defaults;
		this.options(c);
		//this.init();
	}
	uploader.fn = uploader.prototype = {
		init: function () {
			var def = uploader.defaults, self = this, c = this.config, key = null, generatedForm = false,
				formId = c.formId + this.index, fileDom = null, formDom = null, backup = {},
				form = '<form name="" id="' + formId +
						'" method="post" action=""  enctype="multipart/form-data" target="' + def.iframeName + 
						'" style="display:inline-block;"></form>',
				iframe = '<iframe name="' + def.iframeName + '" style="display:none"></iframe>',
				file = $('#' + c.fileElement).clone();
            if (!window.frames[c.iframeName]) {
                $('body').append(iframe);
            }
            fileDom = $('#' + c.fileElement);
            formDom = fileDom.parents('form');
            if (formDom.length === 0) {
            	formDom = $(form).attr('action', c.url);
	            $('#' + c.fileElement).replaceWith(formDom);
	            $('#' + formId).append(file);
	            generatedForm = true;
            }
            $('#' + c.fileElement).change(function () {
            	if (typeof(c.onSelect) === 'function') {
            		c.onSelect.call(self, $(this).val());
            	}
            });

            $(this.uploadButton).click(function (e) {
            	var c = self.config;
            	if ($('#' + c.fileElement).val().length === 0) {
            		if (typeof(c.empty) === 'function') {
            			c.empty();
            		}
            		return false;
            	}
            	if (typeof(c.beforeUpload) === 'function') {
            		c.beforeUpload.call(self);
            	}

            	fileDom = $('#' + c.fileElement);
	            formDom = fileDom.parents('form');
	            if (!generatedForm) {
	            	backup.id = formDom.attr('id');
	            	backup.name = formDom.attr('name');
	            	backup.action = formDom.attr('action');
	            	backup.method = formDom.attr('method');
	            	backup.enctype = formDom.attr('enctype');
	            	backup.target = formDom.attr('target');

	            	formDom.attr({
	            		action: c.url,
	            		enctype: 'multipart/form-data',
	            		target: c.iframeName,
	            		method: 'POST'
	            	});
	            }
            	formDom.submit();
            	// Has to use setTimeout.
            	if (!generatedForm) {
	            	setTimeout(function () {
	            		for (key in backup) {
		            		if (backup[key] === undefined) {
		            			formDom.removeAttr(key);
		            		} else {
		            			formDom.attr(key, backup[key]);
		            		}
		            	}
	            	}, 1000);
            	}
            	/*for (key in backup) {
            		if (backup[key] === undefined) {
            			formDom.removeAttr(key);
            		} else {
            			formDom.attr(key, backup[key]);
            		}
            	}*/
            });
		},
		options: function (c) {
			this.config = $.extend(true, {}, this.config, c);
			return this;
		},
		getFiles: function () {
			return this.files;
		},
		// It's a call back from the server,
		success: function (rst) { 
			var c = this.config, ul = null, li = null, len = 0, key = '', tmp = null, data = {}, me = null, self = this, a = null;
			$('#' + c.fileElement).val('');
			if (typeof(c.dataFilter) === 'function') {
				rst = c.dataFilter.call(self, rst);
			}
			this.files.push(rst);
			if (c.list && c.list.element) {
				ul = $('#' + c.list.element);
				if (ul.length > 0) {
					li = $('<li></li>');
					if (rst.fileName) {
						li.append(c.list.fileTemplate.replace('{name}', rst.fileName).replace('{size}', rst.fileSize));
						ul.append(li);
						if (c.list.allowDelete && rst.id) {
							a = $(c.list.deleteButtonTemplate);
							li.append(a);
							a.click(function () {
								me = this;
								if (typeof(c.list.beforeRemove) === 'function') {
									if(!c.list.beforeRemove(this, rst.id, rst)) {
										return false;
									}
								}
								if (typeof(c.list.remove) === 'function') {
									c.list.remove(this, rst.id, rst);
								} else {
									tmp = c.list.ajaxParams;
									for (key in tmp) {
										if (rst[tmp[key]])
											data[tmp[key]] = rst[tmp[key]];
									}
									$.ajax({
										type: 'POST',
										url: c.list.deleteUrl,
										data: data,
										success: function (d) {
											if (typeof(c.list.afterRemove) === 'function') {
												c.list.afterRemove.call(self, me, rst.id, rst);
											}
											tmp = true;
											if (typeof(c.list.onRemoveSuccess) === 'function') {
												tmp = c.list.onRemoveSuccess.call(self, me, rst.id, rst);
											}
											if (tmp) {
												li.remove();
												tmp = self.files;
												for(key in tmp) {
													if (tmp[key].id == rst.id) {
														self.files.splice(key, 1);
													}
												}
											}
										},
										error: function () {
											if (typeof(c.list.afterRemove) === 'function') {
												c.list.afterRemove.call(self, me, rst.id, rst);
											}
											alert('error');
										}
									});
								}
							});
						}
					}
					for (key in rst) {
						li.attr(key, rst.key);
					}
				}
			}
			if (typeof(c.success) === 'function') {
				c.success.call(this, rst);
			}
			if (typeof(c.afterUpload) === 'function') {
				c.afterUpload.call(this, rst);
			}
		},
		// It's a call back from the server,
		error: function (rst) { 
			var c = this.config;
			alert(rst);
			if (typeof(c.error) === 'function') {
				c.error.call(this, rst);
			}
			if (typeof(c.afterUpload) === 'function') {
				c.afterUpload.call(this, rst);
			}
		}
	};

	uploader.list = [];
	uploader.count = 0;
	uploader.defaults = {
		// The iframe name
		iframeName: 'ju_iframe_file',	
		// The form id
		formId: 'ju_frm_file',		
		// Upload process
		url: 'upload.php',		
		// Set to false, will not show the uploaded files list
		list: {		
			// The <ul> to show the uploaded files
			element: '',
			// Show the delete button for each file
			allowDelete: true,
			// The html template for the file.
			fileTemplate: '<span>{name}</span>',
			// The html template for the delete button
			deleteButtonTemplate: '<a href="javascript:;">delete</a>',
			// Delete file process
			deleteUrl: 'delete.php',		
			// The ajax params for the delete process
			ajaxParams: ['id'],			
			// After you clicked the delete button, return false the delete action will be canceled
			beforeRemove: function (eventSource, id, item) {
				if (confirm('你确定要删除这个文件吗?')) {
					$(eventSource).hide().after('<span class="ju-removing"></span>');
					return true;
				}
				return false;
			},
			// Caused when the delete ajax is done, no matter delete success or failed.
			afterRemove: function (eventSource, id, item, ajaxReturn) {
				if ($(eventSource).length > 0 && $(eventSource).css('display') === 'none') {
					$(eventSource).show().next().remove();
				}
			},
			// Caused when the server side delete the file, return false will not delete the file in the file list in the page.
			onRemoveSuccess: function (eventSource, id, item, ajaxReturn) { return true;},
		},
		listElement: false,
		// Before File upload will cause this event, no matter it's successfull or failed
		beforeUpload: function () {
			$(this.uploadButton).hide().after('<span class="ju-uploading"></span>');
		},
		// File upload done will cause this event, no matter it's successfull or failed
		afterUpload: function (rst) {
			$(this.uploadButton).show().next().remove();
		},
		// File upload success will cause this event
		success: function (rst) {
		},
		// File upload error will cause this event
		error: function (rst) {
		},
		// Clicked the upload button while there is no file selected
		empty: function () {

		},
		// Whem selected a file
		onSelect: function (name) {
			
		},
		// Handle the return value
		dataFilter: null

	};
	$.fn.uploader = function (config) {
		var idx = uploader.count, id = $(this).attr('id'), tmp = null;
        if (!id) {
        	id = 'ju_' + idx;
        	$(this).attr('id', id);
        }
        config = config ? config : {}
        if (typeof(config) === 'string' && uploader.fn[config]) {
            return uploader.fn[config].apply(uploader.list[id], Array.prototype.slice.call(arguments, 1));
        } else if (typeof(config) === 'object') {
        	if (uploader.list[id]) {
        		uploader.list[id].options(config);
        	} else {
            	uploader.list[id] = new uploader(this, idx, config);
            	uploader.count++;
        	}
            return uploader.list[id];
        } else {
            $.error(config + ' does not exist on jQuery.uploader');
            return false;
        }
	}
	$.uploader = uploader;
})(jQuery);