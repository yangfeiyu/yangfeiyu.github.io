/*
	芝麻到家native组件平台 通信协议JS框架
	author：tinghai（2015-09-16）
*/
//一层api，需要初始化到本地的messagehandlerqueue
// 框架命名空间定义
var ZmdjCom = {};

// 组件平台通信框架定义
ZmdjCom.Kernel = (function() 
{
	if (ZmdjCom.Bridge) {return;}

	var responseCallbacks = {};
	var uniqueId = 1;

	function init(messageHandler) 
	{
		if (ZmdjCom.Bridge._messageHandler){ return; } //throw new Error('ZmdjCom.Bridge.init called twice'); }
		ZmdjCom.Bridge._messageHandler = messageHandler;
	};

	//组件调用native接口
	function _jsGetData(message, responseCallback) 
	{
		//message={type:"",data:"",callbackid:""}
		if (responseCallback) 
		{
			var callbackId = 'ZmdjCom_'+(uniqueId++)+'_'+new Date().getTime();
			responseCallbacks[callbackId] = responseCallback;
			message['callbackId'] = callbackId;
		}
		ZmdjNaCom.jsGetData(message);
	};

	// native调JS接口
	function _naGetData(messageJSON) 
	{
		var message = JSON.parse(messageJSON);
		//message={type:"",data:"",callbackid:"",responseid:""}
		if (message.responseId) //单纯回调
		{
			var responseCallback = responseCallbacks[message.responseId];
			if (!responseCallback) { return; }

			responseCallback(message.responseData);
			delete responseCallbacks[message.responseId];
		} else {
			var data;
			var handler = BMapCom.Bridge._messageHandler;
			if (message.type) 
			{
				handler = ZmdjComApi[message.type];
			}

			try {
				// 在这里执行操作，handler有可能为空（没有提前在JS里注册）
				data = handler(message.data);
				if (message.callbackId) //回调
				{
					var callbackResponseId = message.callbackId;
					ZmdjNaCom.jsGetData({ responseId:callbackResponseId, data:resdata });
				}
			} catch(exception) {
				if (typeof console != 'undefined') {
					console.log("BMapCom.Bridge: WARNING: javascript handler threw.", message, exception);
				}
				return;
			}
		}
	};

	ZmdjCom.Bridge = 
	{
		init: init,
		jsGetData: _jsGetData,
		naGetData: _naGetData
	};

	var bridge = ZmdjCom.Bridge;
	bridge.init(function(message, responseCallback) {});

})();


