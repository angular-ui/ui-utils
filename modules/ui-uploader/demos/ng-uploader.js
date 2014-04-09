/*
* Author: Remy Alain Ticona Carbajal http://realtica.org
* Description: The main objective of ng-uploader is to have a user control,
* clean, simple, customizable, and above all very easy to implement.
* Licence: GNU version 3
*/
var uploader=angular.module('ui.ng-uploader', [])
.directive('ngUploader', ['uploaderFactory','$log',function (uploaderFactory,$log) {
return {
  data:uploaderFactory.data,
  restrict: 'AEC',
	//template:'<div class="panel panel-info"><div class="panel-heading"><input class="btn btn-default" type="file" name="{{file.parameter}}" multiple/></div><div class="panel-body"><div ng-repeat="file in fileList"  style="text-align:center;" class="bg-primary"><span>{{file.filename}}</span><button ng-click="erase(this)" type="button" class="close" aria-hidden="true">&times;</button><div class="progress"><div min-width="10%" class="progress-bar" role="progressbar" aria-valuenow="{{file.value}}" aria-valuemin="0" aria-valuemax="100" style="width: {{file.value}}%;">{{file.size}}/{{file.total}}</div></div></div><button class="btn btn-success" ng-click="startUpload()">Upload</button></div></div>',
	templateUrl:'template.html',
	link: function($scope, element, attrs) {
		$scope.wtf;
	$scope.fileList=[];	
	$scope.concurrency=(typeof attrs.concurrency=="undefined")?2:attrs.concurrency;
    $scope.concurrency=parseInt($scope.concurrency);
	$scope.parameter=(typeof attrs.name=="undefined")?"file":attrs.name;
	$scope.activeUploads=0;	
	$scope.getSize=function(bytes) {
        var sizes = [ 'n/a', 'bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EiB', 'ZiB', 'YiB' ];
        var i = +Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, i)).toFixed(i ? 1 : 0) + ' ' + sizes[isNaN(bytes) ? 0 : i + 1];
    }
	
	
	element.find("input").bind("change", function(e) {
		var files=e.target.files;
		for ( var i = 0; i < files.length; i++) {			
			$scope.fileList.push({
				parameter:$scope.parameter,
				active:false,
				filename:files[i].name,
				file:files[i],
				value:(0/files[i].size)*100,
				size:0,
				total:$scope.getSize(files[i].size)
			});
			           
		}
		$scope.$apply();
			//$scope.startUpload();
	});
	$scope.erase=function(ele){
		$log.info("file erased=");
		$scope.fileList.splice( $scope.fileList.indexOf(ele), 1 );
	};
	$scope.onProgress=function(upload, loaded){
		$log.info("progress="+loaded);
		upload.value=(loaded/upload.file.size)*100;
		upload.size=$scope.getSize(loaded);
		$scope.$apply();
	};	
		
	$scope.onCompleted=function(upload){
		$log.info("file uploaded="+upload.filename);
		$scope.activeUploads-=1;
		$scope.fileList.splice( $scope.fileList.indexOf(upload), 1 );
		$scope.$apply();
		$scope.startUpload();
	}	

	  $scope.startUpload=function(){
		  $log.info("URL="+attrs.ngUploader); 
		//$log.info("Init Upload");
		 
		 // $scope.concurrency=($scope.concurrency==undefined)?2:$scope.concurrency;
		  for(var i in $scope.fileList){		  
			  if ($scope.activeUploads == $scope.concurrency) {
                break;
              }
			  
			  if($scope.fileList[i].active)
				  continue;
			  $scope.ajaxUpload($scope.fileList[i]);
			  
		  }
		    
	  };
	
	$scope.ajaxUpload=function(upload) {
                   
            var xhr, formData, prop, data = "", key = "" || 'file', index;
            //index = upload.count;
            console.log('Beging upload: ' + upload.filename);
            $scope.activeUploads+=1;
			upload.active=true;
            xhr = new window.XMLHttpRequest();
            formData = new window.FormData();
            xhr.open('POST', attrs.ngUploader);

            // Triggered when upload starts:
            xhr.upload.onloadstart = function() {
                // File size is not reported during start!
                console.log('Upload started: ' + upload.filename);
                //methods.OnStart(upload.newname);
            };

            // Triggered many times during upload:
            xhr.upload.onprogress = function(event) {
                // console.dir(event);
                if (!event.lengthComputable) { return; }

                // Update file size because it might be bigger than reported by
                // the fileSize:
                console.log("File: " + upload.filename);
                //methods.OnProgress(xhr,event.total, event.loaded, index, upload.newname,upload);
				$scope.onProgress(upload, event.loaded);
            };

            // Triggered when upload is completed:
            xhr.onload = function(event) {
                console.log('Upload completed: ' + upload.filename);
				$scope.onCompleted(upload);
               
            };

            // Triggered when upload fails:
            xhr.onerror = function() {
                console.log('Upload failed: ', upload.filename);
            };

            // Append additional data if provided:
            if (data) {
                for (prop in data) {
                    if (data.hasOwnProperty(prop)) {
                        console.log('Adding data: ' + prop + ' = ' + data[prop]);
                        formData.append(prop, data[prop]);
                    }
                }
            }

            // Append file data:
            formData.append(key, upload.file, upload.parameter);

            // Initiate upload:
            xhr.send(formData);
          
          return xhr;
        };			
		
	}
};
}]
).factory('uploaderFactory',function(){
return{
data:4454,
startUpload:function(){
  alert("funcaaa");
}
};
});