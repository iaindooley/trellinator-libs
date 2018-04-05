var Comment = function(data)
{
    this.data = data;

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
}
