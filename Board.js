var Board = function(arg)
{    
    this.id = arg;
  
    this.writeMessage = function()
    {
      writeInfo(this.id);
    }
    
    this.moveCards = function(params)
    {
        //console.log("ohai moving");
        return this;
    }
    
    this.findCard = function(params)
    {
        //console.log("hai again!");
        return this;
    }
    
    this.move = function(params)
    {
        //console.log("again! again!");
        return this;
    }
    
    return this;
}
