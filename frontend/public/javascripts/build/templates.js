this["templates"] = this["templates"] || {};

this["templates"]["views/partials/contents.hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n    ";
  stack1 = helpers.each.call(depth0, depth0.miners, {hash:{},inverse:self.noop,fn:self.program(2, program2, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n";
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = "", stack1, stack2;
  buffer += "\n        <div class=\"panel ";
  stack2 = helpers['if'].call(depth0, ((stack1 = depth0.miner),stack1 == null || stack1 === false ? stack1 : stack1.connected), {hash:{},inverse:self.program(5, program5, data),fn:self.program(3, program3, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\">\n            <div class=\"panel-heading\">\n                <div class=\"row\">\n                    <h2 class=\"panel-title col-xs-6\">"
    + escapeExpression(((stack1 = ((stack1 = depth0.config),stack1 == null || stack1 === false ? stack1 : stack1.name)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</h2>\n                    <div class=\"col-xs-6\"><span class=\"pull-right\">";
  stack2 = helpers['if'].call(depth0, ((stack1 = depth0.miner),stack1 == null || stack1 === false ? stack1 : stack1.connected), {hash:{},inverse:self.program(9, program9, data),fn:self.program(7, program7, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "</span></div>\n                </div>\n            </div>\n            ";
  stack2 = helpers['if'].call(depth0, ((stack1 = depth0.miner),stack1 == null || stack1 === false ? stack1 : stack1.connected), {hash:{},inverse:self.noop,fn:self.program(11, program11, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n        </div>\n    ";
  return buffer;
  }
function program3(depth0,data) {
  
  
  return "panel-success";
  }

function program5(depth0,data) {
  
  
  return "panel-danger";
  }

function program7(depth0,data) {
  
  
  return "Connected";
  }

function program9(depth0,data) {
  
  
  return "Disonnected";
  }

function program11(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n                <div class=\"panel-body row\">\n                \n                    <div class=\"col-xs-12 col-sm-6 col-md-4\">\n                        <h3>Status</h3>\n                        <p>Status: Connected</p>\n                        <p>Miner: "
    + escapeExpression(((stack1 = ((stack1 = depth0.miner),stack1 == null || stack1 === false ? stack1 : stack1.description)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</p>\n                        <p>Hardware Errors: "
    + escapeExpression(((stack1 = ((stack1 = depth0.miner),stack1 == null || stack1 === false ? stack1 : stack1.hardwareErrors)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</p>\n                        <p>Current Average Hashrate: "
    + escapeExpression(((stack1 = ((stack1 = depth0.miner),stack1 == null || stack1 === false ? stack1 : stack1.avgHashrate)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + " MH/s</p>\n                        <p>Current Earnings Per "
    + escapeExpression(((stack1 = ((stack1 = depth0.earnings),stack1 == null || stack1 === false ? stack1 : stack1.interval)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + ": "
    + escapeExpression(((stack1 = ((stack1 = depth0.earnings),stack1 == null || stack1 === false ? stack1 : stack1.value)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + " "
    + escapeExpression(((stack1 = ((stack1 = depth0.earnings),stack1 == null || stack1 === false ? stack1 : stack1.currency)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</p>\n                    </div>\n                    <div class=\"col-xs-12 col-sm-3 col-md-4\">\n                        <h3>Shares</h3>\n                        <p>Accepted: "
    + escapeExpression(((stack1 = ((stack1 = ((stack1 = depth0.miner),stack1 == null || stack1 === false ? stack1 : stack1.shares)),stack1 == null || stack1 === false ? stack1 : stack1.accepted)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</p>\n                        <p>Rejected: "
    + escapeExpression(((stack1 = ((stack1 = ((stack1 = depth0.miner),stack1 == null || stack1 === false ? stack1 : stack1.shares)),stack1 == null || stack1 === false ? stack1 : stack1.rejected)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</p>\n                        <p>Stale: "
    + escapeExpression(((stack1 = ((stack1 = ((stack1 = depth0.miner),stack1 == null || stack1 === false ? stack1 : stack1.shares)),stack1 == null || stack1 === false ? stack1 : stack1.stale)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</p>\n                        <p>Discarded: "
    + escapeExpression(((stack1 = ((stack1 = ((stack1 = depth0.miner),stack1 == null || stack1 === false ? stack1 : stack1.shares)),stack1 == null || stack1 === false ? stack1 : stack1.discarded)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</p>\n                    </div>\n                    <div class=\"col-xs-12 col-sm-3 col-md-4\">\n                        <h3>Difficulty</h3>\n                        <p>Accepted: "
    + escapeExpression(((stack1 = ((stack1 = ((stack1 = depth0.miner),stack1 == null || stack1 === false ? stack1 : stack1.difficulty)),stack1 == null || stack1 === false ? stack1 : stack1.accepted)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</p>\n                        <p>Rejected: "
    + escapeExpression(((stack1 = ((stack1 = ((stack1 = depth0.miner),stack1 == null || stack1 === false ? stack1 : stack1.difficulty)),stack1 == null || stack1 === false ? stack1 : stack1.rejected)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</p>\n                        <p>Stale: "
    + escapeExpression(((stack1 = ((stack1 = ((stack1 = depth0.miner),stack1 == null || stack1 === false ? stack1 : stack1.difficulty)),stack1 == null || stack1 === false ? stack1 : stack1.stale)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</p>\n                    </div>\n               \n                </div>\n            ";
  return buffer;
  }

function program13(depth0,data) {
  
  
  return "\n    <div class=\"alert alert-danger\">\n        <em>Error:</em> Backend disconnected\n    </div>\n";
  }

  stack1 = helpers['if'].call(depth0, depth0.connected, {hash:{},inverse:self.program(13, program13, data),fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { return stack1; }
  else { return ''; }
  });