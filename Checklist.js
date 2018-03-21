var Checklist = function(data)
{
    this.data       = data;
    this.item_list  = null;
    this.added_item = null;

    this.name = function()
    {
        if(!this.data.name)
            this.load();
        
        return this.data.name;
    }

    this.addItem = function(name,position)
    {
        if(!position)
            position = "bottom";

        this.added_item = TrelloApi.post("checklists/"+this.data.id+"/checkItems?name="+encodeURIComponent(name)+"&pos="+encodeURIComponent(position));
        return this;
    }
    
    this.items = function()
    {
        if(!this.item_list)
            this.item_list = new IterableCollection(TrelloApi.get("checklists/"+this.data.id+"/checkItems"));

        return this.item_list;
    }
    
    this.load = function()
    {
        this.data = TrelloApi.get("checklists/"+this.data.id+"?cards=all&checkItems=all&checkItem_fields=all&fields=all");
        return this;
    }
}
