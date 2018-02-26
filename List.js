var List = function(data)
{    
    this.data = data;
  
    this.name = function(params)
    {
        if(!this.data.name)
            this.load(this.data.id);

        return this.data.name;
    }
    
    this.countCards = function(params)
    {
        if(!this.data.cardCount)
        
        return this;
    }
    
    this.rename = function(new_name)
    {
        //console.log("again! again!");
        return this;
    }
    
    return this;
}
