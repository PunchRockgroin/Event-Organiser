(function ($) {
    $(document).ready(function () {
	
	/* Calendar Dialogs */
	$('#eo-dialog-tabs').tabs();
	$('.eo-dialog').dialog({ 
		autoOpen: false,
		width: 450,
		modal:true,
	});
	$('#events-meta').parent().find('.ui-dialog-titlebar-close').appendTo('.ui-tabs-nav').closest('.ui-dialog').children('.ui-dialog-titlebar').remove();

	/* Calendar */
        var calendar = jQuery('#eo_admin_calendar').fullCalendar({
		firstDay: parseInt(EO_Ajax.startday),
		editable: false,
		lazyFetching: 'true',
		eventColor: '#21759B',
		theme: true,
		customButtons:{
			category:  eventorganiser_cat_dropdown,
			venue:  eventorganiser_venue_dropdown,
			goto: eventorganiser_mini_calendar
		},
		buttonText: {
			today: EO_Ajax.locale.today,
			 month: EO_Ajax.locale.month,
			week: EO_Ajax.locale.week,
			day: EO_Ajax.locale.day,
			cat: EO_Ajax.locale.cat,
			venue: EO_Ajax.locale.venue
		},
		monthNames: EO_Ajax.locale.monthNames,
		monthNamesShort: EO_Ajax.locale.monthAbbrev,
		dayNames: EO_Ajax.locale.dayNames,
		dayNamesShort: EO_Ajax.locale.dayAbbrev,
		header: {
			left: 'title',
                	center: 'category venue',
                	right: 'prev goto today next'
		},
		buttonIcons: false,
		buttonui: true,
		events: function (start, end, callback) {
                	jQuery.ajax({
				url: EO_Ajax.ajaxurl + "?action=event-admin-cal",
                    		dataType: 'JSON',
				data: {
					start: jQuery.fullCalendar.formatDate(start, 'yyyy-MM-dd'),
                        		end: jQuery.fullCalendar.formatDate(end, 'yyyy-MM-dd')
                    		},
                    		success: function (data) {
                        		callback(data)
                    		}
                	})
		},
		categories: EO_Ajax.categories,
		venues: EO_Ajax.venues,
		selectable: true,
		selectHelper: true,
		eventRender: function (event, element) {
			cat = jQuery(".filter-category .eo-cal-filter").val();
                	venue = jQuery(".filter-venue .eo-cal-filter").val();
                	if (typeof cat !== "undefined" && cat != '' && (jQuery.inArray(cat, event.category) < 0)) {
                    		return '<div></div>'
                	}
                	if (typeof venue !== "undefined" && venue != '' && venue != event.venue) {
                    		return '<div></div>'
                	}
		},
		weekMode: 'variable',
		aspectRatio: 1.50,
		loading: function (bool) {
			if (bool) jQuery('#loading').show();
                	else jQuery('#loading').hide()
		},
		timeFormat: EO_Ajax.timeFormat,
		eventClick: function (event, jsevent, view) {
                	jsevent.preventDefault();
                	jQuery("#eo-dialog-tab-summary").html('<div id="eo-cal-meta">' + event.summary + '</div>');
			$('#events-meta').dialog('open');
		},
		select: function (startDate, endDate, allDay, jsEvent, view) {
                	if (EO_Ajax.perm_edit) {
				jsEvent.preventDefault();
				fc_format = 'yyyy-MM-dd';
				options = jQuery(this)[0].calendar.options;
				start_date = jQuery.fullCalendar.formatDate(startDate, fc_format);
				start_time = jQuery.fullCalendar.formatDate(startDate, 'HH:mm');
                    		end_date = jQuery.fullCalendar.formatDate(endDate, fc_format);
                    		end_time = jQuery.fullCalendar.formatDate(endDate, 'HH:mm');
                    		if (allDay) {
					format = 'ddd, dS MMMM';
                        		allDay = 1
                    		} else {
                        		format = 'ddd, dS MMMM h(:mm)tt';
                        		allDay = 0
                   	 	}
                    		if (start_date == end_date) {
                        		the_date = jQuery.fullCalendar.formatDate(startDate, format, options);
                        		if (!allDay) {
                            			the_date = the_date + ' &mdash; ' + jQuery.fullCalendar.formatDate(endDate, 'h(:mm)tt', options)
                        		}
                    		} else {
                        		the_date = jQuery.fullCalendar.formatDate(startDate, format, options) + ' &mdash; ' + jQuery.fullCalendar.formatDate(endDate, format, options)
                    		}
                    			$("#eo_event_create_cal input[name='eo_event[event_title]']").val('');
                    			$("#eo_event_create_cal select[name='eo_event[Venue']] option:first-child").attr("selected", 'selected');
                    			$("#eo_event_create_cal input.ui-autocomplete-input").val('');
                    			$("#eo_event_create_cal textarea[name='eo_event[event_content]']").val('');
                    			$("#eo_event_create_cal input[name='eo_event[StartDate]']").val(start_date);
                    			$("#eo_event_create_cal input[name='eo_event[StartTime]']").val(start_time);
			                $("#eo_event_create_cal input[name='eo_event[EndDate]']").val(end_date);
					$("#eo_event_create_cal input[name='eo_event[FinishTime]']").val(end_time);
                    			$("#eo_event_create_cal input[name='eo_event[allday]']").val(allDay);
                   			$("#eo_event_create_cal td#date").html(the_date);
					$('#eo_event_create_cal').dialog('open');
					$("form.eo_cal input[type='submit']").removeAttr('disabled');
					$("form.eo_cal input#reset").click(function (event) {
                        			tb_remove()
                    			})
                	}
		}
        });

	/* Update time format screen option */
        $('#eofc_time_format').change(function () {
            format = ($('#eofc_time_format').is(":checked") ? 'HH:mm' : 'h:mmtt');
            calendar.fullCalendar('option', 'timeFormat', format).fullCalendar('rerenderEvents');
            $.post(ajaxurl, {
                action: 'eofc-format-time',
                is24: $('#eofc_time_format').is(":checked"),
            });
        });


	/* View tabs */
        $('.view-button').click(function (event) {
		event.preventDefault();
		$('.view-button').removeClass('active');
		calendar.fullCalendar('changeView', $(this).attr('id'));
		$(this).addClass('active')
        });

	/* GoTo 'mini calendar' */
	function eventorganiser_mini_calendar(){
		element = $("<span class='fc-header-goto'><input type='hidden' id='miniCalendar'/></span>");
		return element;
	}
        $('#miniCalendar').datepicker({
            dateFormat: 'DD, d MM, yy',
            firstDay: parseInt(EO_Ajax.startday),
            changeMonth: true,
            monthNamesShort: EO_Ajax.locale.monthAbbrev,
            dayNamesMin: EO_Ajax.locale.dayAbbrev,
            changeYear: true,
            showOn: 'button',
            buttonText: EO_Ajax.locale.gotodate,
            onSelect: function (dateText, dp) {
                calendar.fullCalendar('gotoDate', new Date(Date.parse(dateText)))
            }
        });
        $('button.ui-datepicker-trigger').button();

	/* Venue & Category Filters */
	function eventorganiser_cat_dropdown(options){

		var terms = options.categories;

		var html="<select class='eo-cal-filter' id='eo-event-cat'>";
		html+="<option value=''>"+options.buttonText.cat+"</option>";
		for (var i=0;i<terms.length; i++) {
			html+= "<option class='cat-slug-"+terms[i].slug+" cat' value='"+terms[i].slug+"'>"+terms[i].name+"</option>";
		}
		html+="</select>";

		return $("<span class='fc-header-dropdown filter-category'></span>").append(html);
	}

	function eventorganiser_venue_dropdown(options){

		var venues = options.venues;

		var html="<select class='eo-cal-filter' id='eo-event-venue'>";
		html+="<option value=''>"+options.buttonText.venue+"</option>";

		for (var i=0; i<venues.length; i++){
			html+= "<option value='"+venues[i].term_id+"'>"+venues[i].name+"</option>";
		}
		html+="</select>";

		return $("<span class='fc-header-dropdown filter-venue'></span>").append(html);
	}
        $(".eo-cal-filter").change(function () {
            calendar.fullCalendar('rerenderEvents')
        });
        $('.filter-venue .eo-cal-filter').selectmenu({
            wrapperElement: "<span class='fc-header-filter'></span>"
        });
        $('.filter-category .eo-cal-filter').selectmenu({
            wrapperElement: "<span class='fc-header-filter'></span>",
            icons: [{find: '.cat'}, ]
        });
        w = $('#eo-event-venue-button').width() + 30;
        $('#eo-event-venue-button').width(w + 'px');
        $('#eo-event-venue-menu').width(w + 'px');
        w2 = $('#eo-event-cat-button').width() + 30;
        $('#eo-event-cat-button').width(w2 + 'px');
        $('#eo-event-cat-menu').width(w2 + 'px');
    });
})(jQuery);
/*
 * jQuery UI selectmenu dev version
 *
 * Copyright (c) 2009 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI
 * https://github.com/fnagel/jquery-ui/wiki/Selectmenu
 */
(function($){$.widget("ui.selectmenu",{getter:"value",version:"1.9",eventPrefix:"selectmenu",options:{transferClasses:true,typeAhead:1000,style:'dropdown',positionOptions:{my:"left top",at:"left bottom",offset:null},width:null,menuWidth:null,handleWidth:26,maxHeight:null,icons:null,format:null,escapeHtml:false,bgImage:function(){},wrapperElement:"<div />"},_create:function(){var self=this,o=this.options;var selectmenuId=(this.element.attr('id')||'ui-selectmenu-'+Math.random().toString(16).slice(2,10)).replace(':','\\:');this.ids=[selectmenuId,selectmenuId+'-button',selectmenuId+'-menu'];this._safemouseup=true;this.isOpen=false;this.newelement=$('<a />',{'class':this.widgetBaseClass+' ui-widget ui-state-default ui-corner-all','id':this.ids[1],'role':'button','href':'#nogo','tabindex':this.element.attr('disabled')?1:0,'aria-haspopup':true,'aria-owns':this.ids[2]});this.newelementWrap=$(o.wrapperElement).append(this.newelement).insertAfter(this.element);var tabindex=this.element.attr('tabindex');if(tabindex){this.newelement.attr('tabindex',tabindex)}this.newelement.data('selectelement',this.element);this.selectmenuIcon=$('<span class="'+this.widgetBaseClass+'-icon ui-icon"></span>').prependTo(this.newelement);this.newelement.prepend('<span class="'+self.widgetBaseClass+'-status" />');this.element.bind({'click.selectmenu':function(event){self.newelement.focus();event.preventDefault()}});this.newelement.bind('mousedown.selectmenu',function(event){self._toggle(event,true);if(o.style=="popup"){self._safemouseup=false;setTimeout(function(){self._safemouseup=true},300)}return false}).bind('click.selectmenu',function(){return false}).bind("keydown.selectmenu",function(event){var ret=false;switch(event.keyCode){case $.ui.keyCode.ENTER:ret=true;break;case $.ui.keyCode.SPACE:self._toggle(event);break;case $.ui.keyCode.UP:if(event.altKey){self.open(event)}else{self._moveSelection(-1)}break;case $.ui.keyCode.DOWN:if(event.altKey){self.open(event)}else{self._moveSelection(1)}break;case $.ui.keyCode.LEFT:self._moveSelection(-1);break;case $.ui.keyCode.RIGHT:self._moveSelection(1);break;case $.ui.keyCode.TAB:ret=true;break;case $.ui.keyCode.PAGE_UP:case $.ui.keyCode.HOME:self.index(0);break;case $.ui.keyCode.PAGE_DOWN:case $.ui.keyCode.END:self.index(self._optionLis.length);break;default:ret=true}return ret}).bind('keypress.selectmenu',function(event){if(event.which>0){self._typeAhead(event.which,'mouseup')}return true}).bind('mouseover.selectmenu',function(){if(!o.disabled)$(this).addClass('ui-state-hover')}).bind('mouseout.selectmenu',function(){if(!o.disabled)$(this).removeClass('ui-state-hover')}).bind('focus.selectmenu',function(){if(!o.disabled)$(this).addClass('ui-state-focus')}).bind('blur.selectmenu',function(){if(!o.disabled)$(this).removeClass('ui-state-focus')});$(document).bind("mousedown.selectmenu-"+this.ids[0],function(event){if(self.isOpen){self.close(event)}});this.element.bind("click.selectmenu",function(){self._refreshValue()}).bind("focus.selectmenu",function(){if(self.newelement){self.newelement[0].focus()}});if(!o.width){o.width=this.element.outerWidth()}this.newelement.width(o.width);this.element.hide();this.list=$('<ul />',{'class':'ui-widget ui-widget-content','aria-hidden':true,'role':'listbox','aria-labelledby':this.ids[1],'id':this.ids[2]});this.listWrap=$(o.wrapperElement).addClass(self.widgetBaseClass+'-menu').append(this.list).appendTo('body');this.list.bind("keydown.selectmenu",function(event){var ret=false;switch(event.keyCode){case $.ui.keyCode.UP:if(event.altKey){self.close(event,true)}else{self._moveFocus(-1)}break;case $.ui.keyCode.DOWN:if(event.altKey){self.close(event,true)}else{self._moveFocus(1)}break;case $.ui.keyCode.LEFT:self._moveFocus(-1);break;case $.ui.keyCode.RIGHT:self._moveFocus(1);break;case $.ui.keyCode.HOME:self._moveFocus(':first');break;case $.ui.keyCode.PAGE_UP:self._scrollPage('up');break;case $.ui.keyCode.PAGE_DOWN:self._scrollPage('down');break;case $.ui.keyCode.END:self._moveFocus(':last');break;case $.ui.keyCode.ENTER:case $.ui.keyCode.SPACE:self.close(event,true);$(event.target).parents('li:eq(0)').trigger('mouseup');break;case $.ui.keyCode.TAB:ret=true;self.close(event,true);$(event.target).parents('li:eq(0)').trigger('mouseup');break;case $.ui.keyCode.ESCAPE:self.close(event,true);break;default:ret=true}return ret}).bind('keypress.selectmenu',function(event){if(event.which>0){self._typeAhead(event.which,'focus')}return true}).bind('mousedown.selectmenu mouseup.selectmenu',function(){return false});$(window).bind("resize.selectmenu-"+this.ids[0],$.proxy(self.close,this))},_init:function(){var self=this,o=this.options;var selectOptionData=[];this.element.find('option').each(function(){var opt=$(this);selectOptionData.push({value:opt.attr('value'),text:self._formatText(opt.text()),selected:opt.attr('selected'),disabled:opt.attr('disabled'),classes:opt.attr('class'),typeahead:opt.attr('typeahead'),parentOptGroup:opt.parent('optgroup'),bgImage:o.bgImage.call(opt)})});var activeClass=(self.options.style=="popup")?" ui-state-active":"";this.list.html("");if(selectOptionData.length){for(var i=0;i<selectOptionData.length;i++){var thisLiAttr={role:'presentation'};if(selectOptionData[i].disabled){thisLiAttr['class']=this.namespace+'-state-disabled'}var thisAAttr={html:selectOptionData[i].text,href:'#nogo',tabindex:-1,role:'option','aria-selected':false};if(selectOptionData[i].disabled){thisAAttr['aria-disabled']=selectOptionData[i].disabled}if(selectOptionData[i].typeahead){thisAAttr['typeahead']=selectOptionData[i].typeahead}var thisA=$('<a/>',thisAAttr);var thisLi=$('<li/>',thisLiAttr).append(thisA).data('index',i).addClass(selectOptionData[i].classes).data('optionClasses',selectOptionData[i].classes||'').bind("mouseup.selectmenu",function(event){if(self._safemouseup&&!self._disabled(event.currentTarget)&&!self._disabled($(event.currentTarget).parents("ul>li."+self.widgetBaseClass+"-group "))){var changed=$(this).data('index')!=self._selectedIndex();self.index($(this).data('index'));self.select(event);if(changed){self.change(event)}self.close(event,true)}return false}).bind("click.selectmenu",function(){return false}).bind('mouseover.selectmenu focus.selectmenu',function(e){if(!$(e.currentTarget).hasClass(self.namespace+'-state-disabled')&&!$(e.currentTarget).parent("ul").parent("li").hasClass(self.namespace+'-state-disabled')){self._selectedOptionLi().addClass(activeClass);self._focusedOptionLi().removeClass(self.widgetBaseClass+'-item-focus ui-state-hover');$(this).removeClass('ui-state-active').addClass(self.widgetBaseClass+'-item-focus ui-state-hover')}}).bind('mouseout.selectmenu blur.selectmenu',function(){if($(this).is(self._selectedOptionLi().selector)){$(this).addClass(activeClass)}$(this).removeClass(self.widgetBaseClass+'-item-focus ui-state-hover')});if(selectOptionData[i].parentOptGroup.length){var optGroupName=self.widgetBaseClass+'-group-'+this.element.find('optgroup').index(selectOptionData[i].parentOptGroup);if(this.list.find('li.'+optGroupName).length){this.list.find('li.'+optGroupName+':last ul').append(thisLi)}else{$(' <li role="presentation" class="'+self.widgetBaseClass+'-group '+optGroupName+(selectOptionData[i].parentOptGroup.attr("disabled")?' '+this.namespace+'-state-disabled" aria-disabled="true"':'"')+'><span class="'+self.widgetBaseClass+'-group-label">'+selectOptionData[i].parentOptGroup.attr('label')+'</span><ul></ul></li> ').appendTo(this.list).find('ul').append(thisLi)}}else{thisLi.appendTo(this.list)}if(o.icons){for(var j in o.icons){if(thisLi.is(o.icons[j].find)){thisLi.data('optionClasses',selectOptionData[i].classes+' '+self.widgetBaseClass+'-hasIcon').addClass(self.widgetBaseClass+'-hasIcon');var iconClass=o.icons[j].icon||"";thisLi.find('a:eq(0)').prepend('<span class="'+self.widgetBaseClass+'-item-icon ui-icon '+iconClass+'"></span>');if(selectOptionData[i].bgImage){thisLi.find('span').css('background-image',selectOptionData[i].bgImage)}}}}}}else{$('<li role="presentation"><a href="#nogo" tabindex="-1" role="option"></a></li>').appendTo(this.list)}var isDropDown=(o.style=='dropdown');this.newelement.toggleClass(self.widgetBaseClass+'-dropdown',isDropDown).toggleClass(self.widgetBaseClass+'-popup',!isDropDown);this.list.toggleClass(self.widgetBaseClass+'-menu-dropdown ui-corner-bottom',isDropDown).toggleClass(self.widgetBaseClass+'-menu-popup ui-corner-all',!isDropDown).find('li:first').toggleClass('ui-corner-top',!isDropDown).end().find('li:last').addClass('ui-corner-bottom');this.selectmenuIcon.toggleClass('ui-icon-triangle-1-s',isDropDown).toggleClass('ui-icon-triangle-2-n-s',!isDropDown);if(o.transferClasses){var transferClasses=this.element.attr('class')||'';this.newelement.add(this.list).addClass(transferClasses)}if(o.style=='dropdown'){this.list.width(o.menuWidth?o.menuWidth:o.width)}else{this.list.width(o.menuWidth?o.menuWidth:o.width-o.handleWidth)}this.list.css('height','auto');var listH=this.listWrap.height();var winH=$(window).height();var maxH=o.maxHeight?Math.min(o.maxHeight,winH):winH/3;if(listH>maxH)this.list.height(maxH);this._optionLis=this.list.find('li:not(.'+self.widgetBaseClass+'-group)');if(this.element.attr('disabled')){this.disable()}else{this.enable()}this.index(this._selectedIndex());this._selectedOptionLi().addClass(this.widgetBaseClass+'-item-focus');window.setTimeout(function(){self._refreshPosition()},200)},destroy:function(){this.element.removeData(this.widgetName).removeClass(this.widgetBaseClass+'-disabled'+' '+this.namespace+'-state-disabled').removeAttr('aria-disabled').unbind(".selectmenu");$(window).unbind(".selectmenu-"+this.ids[0]);$(document).unbind(".selectmenu-"+this.ids[0]);this.newelementWrap.remove();this.listWrap.remove();this.element.unbind(".selectmenu").show();$.Widget.prototype.destroy.apply(this,arguments)},_typeAhead:function(code,eventType){var self=this,c=String.fromCharCode(code).toLowerCase(),matchee=null,nextIndex=null;if(self._typeAhead_timer){window.clearTimeout(self._typeAhead_timer);self._typeAhead_timer=undefined}self._typeAhead_chars=(self._typeAhead_chars===undefined?"":self._typeAhead_chars).concat(c);if(self._typeAhead_chars.length<2||(self._typeAhead_chars.substr(-2,1)===c&&self._typeAhead_cycling)){self._typeAhead_cycling=true;matchee=c}else{self._typeAhead_cycling=false;matchee=self._typeAhead_chars}var selectedIndex=(eventType!=='focus'?this._selectedOptionLi().data('index'):this._focusedOptionLi().data('index'))||0;for(var i=0;i<this._optionLis.length;i++){var thisText=this._optionLis.eq(i).text().substr(0,matchee.length).toLowerCase();if(thisText===matchee){if(self._typeAhead_cycling){if(nextIndex===null)nextIndex=i;if(i>selectedIndex){nextIndex=i;break}}else{nextIndex=i}}}if(nextIndex!==null){this._optionLis.eq(nextIndex).find("a").trigger(eventType)}self._typeAhead_timer=window.setTimeout(function(){self._typeAhead_timer=undefined;self._typeAhead_chars=undefined;self._typeAhead_cycling=undefined},self.options.typeAhead)},_uiHash:function(){var index=this.index();return{index:index,option:$("option",this.element).get(index),value:this.element[0].value}},open:function(event){var self=this,o=this.options;if(self.newelement.attr("aria-disabled")!='true'){self._closeOthers(event);self.newelement.addClass('ui-state-active');self.listWrap.appendTo(o.appendTo);self.list.attr('aria-hidden',false);self.listWrap.addClass(self.widgetBaseClass+'-open');var selected=this._selectedOptionLi();if(o.style=="dropdown"){self.newelement.removeClass('ui-corner-all').addClass('ui-corner-top')}else{this.list.css("left",-5000).scrollTop(this.list.scrollTop()+selected.position().top-this.list.outerHeight()/2+selected.outerHeight()/2).css("left","auto")}self._refreshPosition();var link=selected.find("a");if(link.length)link[0].focus();self.isOpen=true;self._trigger("open",event,self._uiHash())}},close:function(event,retainFocus){if(this.newelement.is('.ui-state-active')){this.newelement.removeClass('ui-state-active');this.listWrap.removeClass(this.widgetBaseClass+'-open');this.list.attr('aria-hidden',true);if(this.options.style=="dropdown"){this.newelement.removeClass('ui-corner-top').addClass('ui-corner-all')}if(retainFocus){this.newelement.focus()}this.isOpen=false;this._trigger("close",event,this._uiHash())}},change:function(event){this.element.trigger("change");this._trigger("change",event,this._uiHash())},select:function(event){if(this._disabled(event.currentTarget)){return false}this._trigger("select",event,this._uiHash())},_closeOthers:function(event){$('.'+this.widgetBaseClass+'.ui-state-active').not(this.newelement).each(function(){$(this).data('selectelement').selectmenu('close',event)});$('.'+this.widgetBaseClass+'.ui-state-hover').trigger('mouseout')},_toggle:function(event,retainFocus){if(this.isOpen){this.close(event,retainFocus)}else{this.open(event)}},_formatText:function(text){if(this.options.format){text=this.options.format(text)}else if(this.options.escapeHtml){text=$('<div />').text(text).html()}return text},_selectedIndex:function(){return this.element[0].selectedIndex},_selectedOptionLi:function(){return this._optionLis.eq(this._selectedIndex())},_focusedOptionLi:function(){return this.list.find('.'+this.widgetBaseClass+'-item-focus')},_moveSelection:function(amt,recIndex){if(!this.options.disabled){var currIndex=parseInt(this._selectedOptionLi().data('index')||0,10);var newIndex=currIndex+amt;if(newIndex<0){newIndex=0}if(newIndex>this._optionLis.size()-1){newIndex=this._optionLis.size()-1}if(newIndex===recIndex){return false}if(this._optionLis.eq(newIndex).hasClass(this.namespace+'-state-disabled')){(amt>0)?++amt:--amt;this._moveSelection(amt,newIndex)}else{this._optionLis.eq(newIndex).trigger('mouseover').trigger('mouseup')}}},_moveFocus:function(amt,recIndex){if(!isNaN(amt)){var currIndex=parseInt(this._focusedOptionLi().data('index')||0,10);var newIndex=currIndex+amt}else{var newIndex=parseInt(this._optionLis.filter(amt).data('index'),10)}if(newIndex<0){newIndex=0}if(newIndex>this._optionLis.size()-1){newIndex=this._optionLis.size()-1}if(newIndex===recIndex){return false}var activeID=this.widgetBaseClass+'-item-'+Math.round(Math.random()*1000);this._focusedOptionLi().find('a:eq(0)').attr('id','');if(this._optionLis.eq(newIndex).hasClass(this.namespace+'-state-disabled')){(amt>0)?++amt:--amt;this._moveFocus(amt,newIndex)}else{this._optionLis.eq(newIndex).find('a:eq(0)').attr('id',activeID).focus()}this.list.attr('aria-activedescendant',activeID)},_scrollPage:function(direction){var numPerPage=Math.floor(this.list.outerHeight()/this._optionLis.first().outerHeight());numPerPage=(direction=='up'?-numPerPage:numPerPage);this._moveFocus(numPerPage)},_setOption:function(key,value){this.options[key]=value;if(key=='disabled'){if(value)this.close();this.element.add(this.newelement).add(this.list)[value?'addClass':'removeClass'](this.widgetBaseClass+'-disabled'+' '+this.namespace+'-state-disabled').attr("aria-disabled",value)}},disable:function(index,type){if(typeof(index)=='undefined'){this._setOption('disabled',true)}else{if(type=="optgroup"){this._disableOptgroup(index)}else{this._disableOption(index)}}},enable:function(index,type){if(typeof(index)=='undefined'){this._setOption('disabled',false)}else{if(type=="optgroup"){this._enableOptgroup(index)}else{this._enableOption(index)}}},_disabled:function(elem){return $(elem).hasClass(this.namespace+'-state-disabled')},_disableOption:function(index){var optionElem=this._optionLis.eq(index);if(optionElem){optionElem.addClass(this.namespace+'-state-disabled').find("a").attr("aria-disabled",true);this.element.find("option").eq(index).attr("disabled","disabled")}},_enableOption:function(index){var optionElem=this._optionLis.eq(index);if(optionElem){optionElem.removeClass(this.namespace+'-state-disabled').find("a").attr("aria-disabled",false);this.element.find("option").eq(index).removeAttr("disabled")}},_disableOptgroup:function(index){var optGroupElem=this.list.find('li.'+this.widgetBaseClass+'-group-'+index);if(optGroupElem){optGroupElem.addClass(this.namespace+'-state-disabled').attr("aria-disabled",true);this.element.find("optgroup").eq(index).attr("disabled","disabled")}},_enableOptgroup:function(index){var optGroupElem=this.list.find('li.'+this.widgetBaseClass+'-group-'+index);if(optGroupElem){optGroupElem.removeClass(this.namespace+'-state-disabled').attr("aria-disabled",false);this.element.find("optgroup").eq(index).removeAttr("disabled")}},index:function(newValue){if(arguments.length){if(!this._disabled($(this._optionLis[newValue]))){this.element[0].selectedIndex=newValue;this._refreshValue()}else{return false}}else{return this._selectedIndex()}},value:function(newValue){if(arguments.length){this.element[0].value=newValue;this._refreshValue()}else{return this.element[0].value}},_refreshValue:function(){var activeClass=(this.options.style=="popup")?" ui-state-active":"";var activeID=this.widgetBaseClass+'-item-'+Math.round(Math.random()*1000);this.list.find('.'+this.widgetBaseClass+'-item-selected').removeClass(this.widgetBaseClass+"-item-selected"+activeClass).find('a').attr('aria-selected','false').attr('id','');this._selectedOptionLi().addClass(this.widgetBaseClass+"-item-selected"+activeClass).find('a').attr('aria-selected','true').attr('id',activeID);var currentOptionClasses=(this.newelement.data('optionClasses')?this.newelement.data('optionClasses'):"");var newOptionClasses=(this._selectedOptionLi().data('optionClasses')?this._selectedOptionLi().data('optionClasses'):"");this.newelement.removeClass(currentOptionClasses).data('optionClasses',newOptionClasses).addClass(newOptionClasses).find('.'+this.widgetBaseClass+'-status').html(this._selectedOptionLi().find('a:eq(0)').html());this.list.attr('aria-activedescendant',activeID)},_refreshPosition:function(){var o=this.options;if(o.style=="popup"&&!o.positionOptions.offset){var selected=this._selectedOptionLi();var _offset="0 "+(this.list.offset().top-selected.offset().top-(this.newelement.outerHeight()+selected.outerHeight())/2)}this.listWrap.zIndex(this.element.zIndex()+1).position({of:o.positionOptions.of||this.newelement,my:o.positionOptions.my,at:o.positionOptions.at,offset:o.positionOptions.offset||_offset,collision:o.positionOptions.collision||o.style=="popup"?'fit':'flip'})}})})(jQuery);
