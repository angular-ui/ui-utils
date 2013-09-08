angular.module("ui.pageslide", []).
directive('pageslide', [
    '$http', '$log', '$parse', '$rootScope', function ($http, $log, $parse, $rootScope) {

        var defaults = {};
        var str_inspect_hint = 'Add testing="testing" to inspect this object';

        /* Return directive definition object */

        return {
            restrict: "A",
            replace: false,
            transclude: false,
            scope: {},
            link: function ($scope, el, attrs) {
                /* Inspect */
                //console.log($scope);
                //console.log(el);
                //console.log(attrs);

                /* parameters */
                var param = {};
                param.side = attrs.pageslide || 'right';
                param.speed = attrs.psSpeed || '0.5';

                /* init */
                var css_class = 'ng-pageslide ps-hidden';
                css_class += ' ps-' + param.side;

                /* expose for debug */
                //deb = el;

                /* DOM manipulation */
                var content = document.getElementById(attrs.href.substr(1));
                var slider = document.createElement('div');
                slider.id = "ng-pageslide";
                slider.className = css_class;

                document.body.appendChild(slider);
                slider.appendChild(content);

                //console.log('Pageslider Done.');

                /* set CSS from parameters */
                if (param.speed){
                    slider.style.transitionDuration = param.speed + 's';
                    slider.style.webkitTransitionDuration = param.speed + 's';
                }

                /*
                * Events
                * */

                el[0].onclick = function(e){
                    e.preventDefault();
                    if (/ps-hidden/.exec(slider.className)){
                        content.style.display = 'none';
                        slider.className = slider.className.replace(' ps-hidden','');
                        slider.className += ' ps-shown';
                        //console.log('show');
                        setTimeout(function(){
                            content.style.display = 'block';
                        },(param.speed * 1000));

                    }

                };

                var close_handler = document.getElementById(attrs.href.substr(1) + '-close');

                if (close_handler){
                    close_handler.onclick = function(e){
                        e.preventDefault();
                        if (/ps-shown/.exec(slider.className)){
                            content.style.display = 'none';
                            slider.className = slider.className.replace(' ps-shown','');
                            slider.className += ' ps-hidden';
                            //console.log('hide');
                        }
                    };
                }

            }
        };

    }]);
