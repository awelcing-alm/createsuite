defmodule BackendWeb.AppSocket do
  use Phoenix.Socket

  channel("system", BackendWeb.SystemChannel)

  @impl true
  def connect(_params, socket, _connect_info) do
    {:ok, socket}
  end

  @impl true
  def id(_socket), do: nil
end
