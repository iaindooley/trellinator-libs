var CheckItem = function(data)
{
    this.data                 = data;
    this.containing_checklist = null;

    this.id = function()
    {
        return this.data.id;
    }

    this.remove = function()
    {
        TrelloApi.del("cards/"+this.containing_checklist.card().data.id+"/checkItem/"+this.data.id);
        return this.containing_checklist;
    }

    this.checklist = function()
    {
        return this.containing_checklist;
    }

    this.setContainingChecklist = function(checklist)
    {
        this.containing_checklist = checklist;
        return this;
    }

    this.setName = function(name)
    {
        TrelloApi.put("cards/"+this.containing_checklist.card().data.id+"/checkItem/"+this.data.id+"?name="+encodeURIComponent(name));
        return this;
    }

    this.url = function()
    {
        if(!this.data.url)
            this.load();
        
        return this.data.url;
    }

    this.mark = function(state)
    {
      TrelloApi.put("cards/"+this.checklist().card().data.id+"/checkItem/"+this.data.id+"?state="+state);
      return this;
    }

    this.state = function()
    {
        if(!this.data.state)
            this.load();
        
        return this.data.state;
    }

    this.name = function()
    {
        if(!this.data.text && !this.data.name)
            this.load();
        
      return (this.data.text)?this.data.text:this.data.name;
    }

    this.load = function()
    {
        this.data = TrelloApi.get("checklists/"+this.containing_checklist.data.id+"/checkitems/"+this.data.id+"?fields=all");
        return this;
    }
}
