var Comment = function(data)
{
    this.data = data;
    this.containing_card = null;

    this.card = function()
    {
      return this.containing_card;
    }
    
    this.text = function()
    {
        if(!this.data.data)
            throw new Error("Malformed comment object");

        return this.data.data.text;
    }

    this.name = function()
    {
        return this.text();
    }
    
    this.setContainingCard = function(card)
    {
      this.containing_card = card;
      return this;
    }
}
