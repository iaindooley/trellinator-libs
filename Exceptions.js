var InvalidDataException = function(msg)
{
  this.msg = msg+"\n\nSTACK: "+Trellinator.getStack();
    
  this.toString = function()
  {
    return this.msg;
  }
}

var InvalidActionException = function(msg)
{
  this.msg = msg+"\n\nSTACK: "+Trellinator.getStack();
  
  this.toString = function()
  {
    return this.msg;
  }
}
