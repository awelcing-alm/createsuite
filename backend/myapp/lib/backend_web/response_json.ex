defmodule BackendWeb.ResponseJSON do
  def success(data), do: %{success: true, data: data, error: nil}
  def error(message), do: %{success: false, data: nil, error: message}
end
