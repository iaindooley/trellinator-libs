var CheckItem = function(data)
{
    this.data                 = data;
    this.containing_checklist = null;

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
        TrelloApi.put("cards/"+this.checklist().card().data.id+"/checkItem/"+elem.data.id+"?state="+state);
    }

    this.state = function()
    {
        if(!this.data.state)
            this.load();
        
        return this.data.state;
    }

    this.name = function()
    {
        if(!this.data.nameHtml && !this.data.name)
            this.load();
        
        return (this.data.name) ? this.data.name:this.data.nameHtml;
    }

    this.load = function()
    {
        this.data = TrelloApi.get("checklists/"+this.containing_checklist.data.id+"/checkitems/"+this.data.id+"?fields=all");
        return this;
    }
}
