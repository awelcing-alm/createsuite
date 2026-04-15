defmodule Backend.Runtime.AgentRegistry do
  def child_spec(_opts) do
    Registry.child_spec(keys: :unique, name: __MODULE__)
  end

  def via_tuple(agent_id), do: {:via, Registry, {__MODULE__, agent_id}}
end
