var Label = function(data)
{    
    this.data  = data;

    this.id = function()
    {
        return this.data.id;
    }
  
    this.name = function()
    {
        if(typeof this.data.name == undefined)
            this.load();

        return this.data.name;
    }
    
    this.load = function()
    {
        this.data = TrelloApi.get("labels/"+this.data.id+"?fields=all");
        return this;
    }
}
