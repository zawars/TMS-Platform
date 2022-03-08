/*--------------------------------------
		CUSTOM FUNCTION WRITE HERE		
--------------------------------------*/
"use strict";
jQuery(document).on('ready', function () {
  /*--------------------------------------
  		MOBILE MENU						
  --------------------------------------*/
  //   function collapseMenu() {
  //     // jQuery('.at-navigation ul li.menu-item-has-children, .at-navigation ul li.menu-item-has-children').prepend('<span class="at-dropdowarrow"><svg class="at-themesvg" data-src="images/svg-icons/arrow_right_icon.svg"></svg></span>');
  //     jQuery('.at-navigation ul li.menu-item-has-children span, .at-navigation ul li.menu-item-has-children a').on('click', function () {
  //       jQuery(this).parent('li').toggleClass('at-open');
  //       // jQuery(this).next('.sub-menu').slideToggle();
  //     });
  //   }
  //   collapseMenu();
  /*--------------------------------------
			TOGGLE SIDEBAR
	--------------------------------------*/
  //   jQuery('.at-btnclosemenu').on('click', function () {
  //     jQuery('#at-wrapper').toggleClass('at-hidesidebar');
  //   });
  /* ---------------------------------------
          STICKY HEADER
  --------------------------------------- */
  //   if (jQuery('#at-header').length > 0) {
  //     jQuery(window).on('scroll', function () {
  //       if (jQuery(this).scrollTop() > 0) {
  //         jQuery('.at-header').addClass('at-fixedme');
  //       } else {
  //         jQuery('.at-header').removeClass('at-fixedme');
  //       }
  //     });
  //   }
  /*--------------------------------------
          THEME VERTICAL SCROLLBAR
  --------------------------------------*/
  // if (jQuery('.at-verticalscrollbar').length > 0) {
  //   var _at_verticalscrollbar = jQuery('.at-verticalscrollbar');
  //   _at_verticalscrollbar.mCustomScrollbar({
  //     axis: "y",
  //   });
  // }
  // if (jQuery('.at-horizontalthemescrollbar').length > 0) {
  //   var _at_horizontalthemescrollbar = jQuery('.at-horizontalthemescrollbar');
  //   _at_horizontalthemescrollbar.mCustomScrollbar({
  //     axis: "x",
  //     advanced: {
  //       autoExpandHorizontalScroll: true
  //     },
  //   });
  // }
  // /*--------------------------------------
  //         PROGRESS BAR                    
  // --------------------------------------*/
  // if(jQuery('#at-ourskill').length > 0){
  //     var _at_ourskill = jQuery('#at-ourskill');
  //     _at_ourskill.appear(function () {
  //         jQuery('.at-skillholder').each(function () {
  //             jQuery(this).find('.at-skillbar').animate({
  //                 width: jQuery(this).attr('data-percent')
  //             }, 2500);
  //         });
  //     });
  // }
  /*--------------------------------------
          CALENDAR
  --------------------------------------*/
  var db_events = [{
      title: "Board members meeting.",
      date: 1532381440036,
      link: "events.com/ev2"
    },
    {
      title: "Delaware branch opening.",
      date: 1532467961534,
      link: "events.com/ev1"
    },
    {
      title: "An important event.",
      date: 1532554405128,
      link: "events.com/ev1"
    }
  ];
  //   $(".at-calendar").MEC({
  //     calendar_link: "example.com/myCalendar",
  //     events: db_events
  //   });


  /*--------------------------------------
          PERFORMANCE CHART
  --------------------------------------*/
  // if(jQuery('#my-chart').length > 0) {
  //     var data = {
  //         labels: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
  //         series: [
  //             {
  //                 data: [1, 10, 3, 13, 3, 13]
  //             }
  //         ]
  //     };
  //     var options = {
  //         axisX: {
  //             labelInterpolationFnc: function (value) {
  //                 return 'Calendar Week ' + value;
  //             }
  //         }
  //     };
  //     var responsiveOptions = [
  //         ['screen and (min-width: 641px) and (max-width: 1024px)', {
  //             showPoint: false,
  //             axisX: {
  //                 labelInterpolationFnc: function (value) {
  //                     return 'Week ' + value;
  //                 }
  //             }
  //         }],
  //         ['screen and (max-width: 640px)', {
  //             showLine: false,
  //             axisX: {
  //                 labelInterpolationFnc: function (value) {
  //                     return 'W' + value;
  //                 }
  //             }
  //         }]
  //     ];
  //     new Chartist.Line('#my-chart', data, options, responsiveOptions);
  // }
  if (jQuery('#my-chart').length > 0) {
    var chart = new Chartist.Line('#my-chart', {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      series: [
        [1, 5, 2, 5, 4],
        [2, 3, 4, 8, 1],
        [5, 4, 3, 2, 1]
      ]
    }, {
      low: 0,
      showArea: true,
      showPoint: true,
      fullWidth: true
    });

    chart.on('draw', function (data) {
      if (data.type === 'line' || data.type === 'area') {
        data.element.animate({
          d: {
            begin: 2000 * data.index,
            dur: 2000,
            from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
            to: data.path.clone().stringify(),
            easing: Chartist.Svg.Easing.easeOutQuint
          }
        });
      }
    });
  }
  /*--------------------------------------
          YEARLY CHART
  --------------------------------------*/
  if (jQuery('#at-yearlychart').length > 0) {
    var data = {
      labels: ['AROOMA', 'SOHAIB', 'ZAHID', 'ABC'],
      series: [
        [5, 4, 3, 7],
      ]
    };
    var options = {
      seriesBarDistance: 50,
    };
    var responsiveOptions = [
      ['screen and (max-width: 640px)', {
        seriesBarDistance: 10,
        axisX: {
          labelInterpolationFnc: function (value) {
            return value[0];
          }
        }
      }]
    ];
    new Chartist.Bar('#at-yearlychart', data, options, responsiveOptions);
  }
  /*--------------------------------------
          YEARLY CHART
  --------------------------------------*/
  if (jQuery('.at-designerchart').length > 0) {
    new Chartist.Pie('.at-designerchart', {
      series: [20, 10, 30, ]
    }, {
      donut: true,
      donutWidth: 30,
      donutSolid: true,
      startAngle: 270,
      showLabel: true
    });
  }
  /*--------------------------------------
          YEARLY CHART
  --------------------------------------*/
  jQuery('.at-btnadduser').on('click', function () {
    jQuery('#at-addcontent').slideToggle();
  });
  /*------------------------------------------
			CONTACTS
	------------------------------------------*/
  // var _at_btnopenclose = ;
  jQuery('#at-btnpencontacts').on('click', function () {
    jQuery('#at-wrapper').toggleClass('at-sidenavshow');
    if (jQuery('#at-wrapper').hasClass('at-sidenavshow')) {
      jQuery('body').addClass('spread-overlay');
      return true;
    }
    jQuery('body').removeClass('spread-overlay');
  });
  // var _tg_close = ;
  jQuery('#at-close').on('click', function () {
    jQuery('#at-wrapper').toggleClass('at-sidenavshow');
    if (jQuery('#at-wrapper').hasClass('at-sidenavshow')) {
      jQuery('body').addClass('spread-overlay');
      return true;
    }
    jQuery('body').removeClass('spread-overlay');
  });



  // var _at_btnopenclose = ;
  jQuery('#at-btnopenpolicies').on('click', function () {
    jQuery('#at-wrapper').toggleClass('at-sidenavshow');
    if (jQuery('#at-wrapper').hasClass('at-sidenavshow')) {
      jQuery('body').addClass('spread-overlaytwo');
      return true;
    }
    jQuery('body').removeClass('spread-overlaytwo');
  });
  // var _tg_close = ;
  jQuery('#at-close2').on('click', function () {
    jQuery('#at-wrapper').toggleClass('at-sidenavshow');
    if (jQuery('#at-wrapper').hasClass('at-sidenavshow')) {
      jQuery('body').addClass('spread-overlaytwo');
      return true;
    }
    jQuery('body').removeClass('spread-overlaytwo');
  });



  // var _at_btnopenclose = ;
  jQuery('#at-btnopenpayslips').on('click', function () {
    jQuery('#at-wrapper').toggleClass('at-sidenavshow');
    if (jQuery('#at-wrapper').hasClass('at-sidenavshow')) {
      jQuery('body').addClass('spread-overlaythree');
      return true;
    }
    jQuery('body').removeClass('spread-overlaythree');
  });
  // var _tg_close = ;
  jQuery('#at-close3').on('click', function () {
    jQuery('#at-wrapper').toggleClass('at-sidenavshow');
    if (jQuery('#at-wrapper').hasClass('at-sidenavshow')) {
      jQuery('body').addClass('spread-overlaythree');
      return true;
    }
    jQuery('body').removeClass('spread-overlaythree');
  });
  /*------------------------------------------
           STACK MODALS
   ------------------------------------------*/
  $('.btn[data-toggle=modal]').on('click', function () {
    var $btn = $(this);
    var currentDialog = $btn.closest('.modal-dialog'),
      targetDialog = $($btn.attr('data-target'));;
    if (!currentDialog.length)
      return;
    targetDialog.data('previous-dialog', currentDialog);
    currentDialog.addClass('aside');
    var stackedDialogCount = $('.modal.in .modal-dialog.aside').length;
    if (stackedDialogCount <= 5) {
      currentDialog.addClass('aside-' + stackedDialogCount);
    }
  });

  $('.modal').on('hide.bs.modal', function () {
    var $dialog = $(this);
    var previousDialog = $dialog.data('previous-dialog');
    if (previousDialog) {
      previousDialog.removeClass('aside');
      $dialog.data('previous-dialog', undefined);
    }
  });
  //   /*------------------------------------------
  //            NEXT EVENT SLIDER
  //    ------------------------------------------*/
  //   $('#at-nexteventslider').owlCarousel({
  //     loop: false,
  //     nav: true,
  //     items: 1,
  //     navText: [
  //       '<i class="icon-arrow_left_icon"></i>',
  //       '<i class="icon-arrow_right_icon"></i>',
  //     ],
  //   })

  /*------------------------------------------
             Datepicker SLIDER
     ------------------------------------------*/
  //   if (jQuery('.datetimepicker1').length > 0) {
  //     // jQuery('#datetimepicker1').datetimepicker();
  //     // jQuery.datetimepicker.setLocale('de');

  //     jQuery('.datetimepicker1').datetimepicker({
  //       i18n: {
  //         de: {
  //           months: [
  //             'Januar', 'Februar', 'März', 'April',
  //             'Mai', 'Juni', 'Juli', 'August',
  //             'September', 'Oktober', 'November', 'Dezember',
  //           ],
  //           dayOfWeek: [
  //             "So.", "Mo", "Di", "Mi",
  //             "Do", "Fr", "Sa.",
  //           ]
  //         }
  //       },
  //       timepicker: false,
  //       format: 'd.m.Y'
  //     });
  //   }



});
