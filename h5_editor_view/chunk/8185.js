"use strict";(self.webpackJsonp=self.webpackJsonp||[]).push([[8185],{"8185":function(n,o,e){e.r(o),e.d(o,{"taro_canvas_core":function(){return r}});var i=e(6566),r=function(){function t(n){var o=this;(0,i.r)(this,n),this.onLongTap=(0,i.c)(this,"longtap",7),this.nativeProps={},this.onTouchStart=function(){o.timer=setTimeout((function(){o.onLongTap.emit()}),500)},this.onTouchMove=function(){clearTimeout(o.timer)},this.onTouchEnd=function(){clearTimeout(o.timer)}}return t.prototype.render=function(){var n=this.canvasId,o=this.nativeProps;return(0,i.h)("canvas",Object.assign({"canvas-id":n,"style":{"width":"100%","height":"100%"},"onTouchStart":this.onTouchStart,"onTouchMove":this.onTouchMove,"onTouchEnd":this.onTouchEnd},o))},Object.defineProperty(t.prototype,"el",{"get":function get(){return(0,i.g)(this)},"enumerable":!1,"configurable":!0}),t}();r.style="taro-canvas-core{display:block;position:relative;width:300px;height:150px}"}}]);